import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// Global variables.
window.wpcf7_ds_ai_loaded_model = false;

const messages = [{
		content: `You are a SQL generator that ONLY outputs valid SQL code with no explanations.`,
		role: "system",
	},
];

class CF7DSSQLQueryGenerator {
	#model      = 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC';
	#texts 		= {
		'in_progress'    		: 'A query generation is already in progress',
		'required_description' 	: 'The query description is required',
		'invalid_response' 		: 'Invalid response format from the model',
		'invalid_sql'			: 'Could not extract valid SQL from model response'
	};
	#isProcessing 	= false;
	#tablePrefix 	= 'wp_';
	#engine;

    constructor(tablePrefix = 'wp_', texts = {}) {
		this.#tablePrefix 	= tablePrefix;
		this.setTexts(texts);
		// Create engine instance
		this.#engine = new webllm.MLCEngine();
		this.#engine.setInitProgressCallback(function( report ){
			console.log("initialize", report.progress);
			document.getElementById('cf7-ds-ai-status').textContent = report.text;
			if (report.progress !== undefined)  document.getElementById('cf7-ds-ai-progress-bar').style.width = `${report.progress * 100}%`;
		});

		if ( ! window.wpcf7_ds_ai_loaded_model ) {
			document.getElementsByClassName('cf7-ds-sql-generator-area')[0].classList.add('cf7-ds-sql-generator-area-disabled');
			this.initializeWebLLMEngine().then(() => {
				document.getElementsByClassName('cf7-ds-sql-generator-area')[0].classList.remove('cf7-ds-sql-generator-area-disabled');
			}).catch(() => {
				this.initializeWebLLMEngine().then(() => {
					document.getElementsByClassName('cf7-ds-sql-generator-area')[0].classList.remove('cf7-ds-sql-generator-area-disabled');
				});
			});
		}
    }

	async initializeWebLLMEngine() {
		document.getElementById('cf7-ds-ai-status').style.display = 'block';
		let config = {
			temperature: 0.0,
			top_p: 1,
			context_window_size: -1,
			sliding_window_size: 2048,
			attention_sink_size: 1024,
		};

		if ( typeof navigator == 'undefined' || ! navigator.gpu ) {
			document.getElementsByClassName('cf7-ds-sql-generator-area')[0].style.display = 'none';
			document.getElementById('cf7-ds-gpu-error').style.display = 'block';
			return;
		}

		if ( typeof window == 'undefined' || ! window.caches ) {
			document.getElementsByClassName('cf7-ds-sql-generator-area')[0].style.display = 'none';
			document.getElementById('cf7-ds-caches-error').style.display = 'block';
			return;
		}

		await this.#engine.reload(this.#model, config);
		await this.#engine.resetChat();
		window.wpcf7_ds_ai_loaded_model = true;
	}

    setTexts(texts = {}) {
        this.#texts = Object.assign(this.#texts, texts);
    }

	getTexts() {
		return this.#texts;
	}

	getIsProcessing() {
		return this.#isProcessing;
	}

    /**
     * Generate a SQL query for WordPress database
     * @param {string} description - The description of what the query should do
     * @returns {Promise<string>} - The generated SQL query
     */
    async generateQuery(description, container) {
		function updateMessage(content) {
			function escapeHTML(str) {
				return str
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;");
			}

			function formatMessage(generatedText) {
				// Prioritize SELECT statements
				const selectPattern = /SELECT[\s\S]*?;/i;
				const selectMatch = generatedText.match(selectPattern);

				if (selectMatch) {
					return selectMatch[0].trim();
				}

				// Fallback to any SQL-like pattern if explicit SELECT not found
				const sqlPattern = /[A-Z][\w\s().,*=<>'"]+(FROM|JOIN)[\w\s().,*=<>'"]+;/i;
				const sqlMatch = generatedText.match(sqlPattern);

				if (sqlMatch) {
					return sqlMatch[0].trim();
				}

				// Final cleanup if no pattern matched
				// Remove markdown code blocks if present
				let cleanedText = generatedText.replace(/```sql|```/gi, "").trim();

				// If it starts with SELECT, assume it's SQL even without semicolon
				if (/^SELECT/i.test(cleanedText)) {
					// Add semicolon if missing
					return cleanedText.endsWith(";") ? cleanedText : `${cleanedText};`;
				}
				return cleanedText;
			}

			let formatted = formatMessage(content);
			container.innerHTML = formatted;
			return formatted;
		} // End updateMessage

		// Check description
		description = String(description).replace(/^[\n\r]*/, '').replace(/[\n\r]*$/, '').trim();

		if (!description.replace(/[\r\n\s]/g,'').length) {
            throw new Error(this.#texts['required_description']);
		}

        if (this.#isProcessing) {
            throw new Error(this.#texts['in_progress']);
        }

        this.#isProcessing = true;

        try {
			await this.#engine.resetChat();

			let curMessage = "";

            // Create a very specific prompt that forces SQL-only output
			messages.splice(1);
			messages.push( {
					content: `You are a SQL generator that ONLY outputs valid SQL code with no explanations.

WordPress Database Context:
- Table prefix: ${this.#tablePrefix}
- Common tables: ${this.#tablePrefix}posts, ${this.#tablePrefix}postmeta, ${this.#tablePrefix}users, ${this.#tablePrefix}comments, ${this.#tablePrefix}options, ${this.#tablePrefix}terms

Task: Generate a SELECT query that does the following:
${description}

IMPORTANT: Your entire response must be ONLY the SQL query with no explanations, comments, or other text.`,
					role: "user",
				}
			);

			const completion = await this.#engine.chat.completions.create({
				stream: true,
				messages
			});

			for await(const chunk of completion) {
				try {
					const curDelta = chunk.choices[0].delta.content;
					if (curDelta) {
						curMessage += curDelta;
					}
					updateMessage(curMessage);
				} catch (err) {}
			}

			const finalMessage = await this.#engine.getMessage();
			return updateMessage(finalMessage);
        } catch (error) {
            console.error("SQL generation error:", error);
            throw error;
        } finally {
            this.#isProcessing = false;
        }
    }
} // End CF7DSSQLQueryGenerator.


// Main App.

(function(){
	if ( 'jQuery' in window ) {
		let $ = jQuery;
		let generator;
		let query = '';

		function esc(v) {
			return v.replace(/</g, '&#60;')
					.replace(/>/g, '&#62;')
					.replace(/\[/g, '&#91;')
					.replace(/\]/g, '&#93;')
					.replace(/"/g, '&#34;');
		};

		function init() {
			if ( typeof generator == 'undefined' ) {
				let db_prefix 	= 'wp_';
				let texts  		= {};

				if( typeof cf7_datasource_admin_settings != 'undefined' ) {
					if ( 'db_prefix' in cf7_datasource_admin_settings ) db_prefix = cf7_datasource_admin_settings['db_prefix'];
					if ( 'sql_generator_texts' in cf7_datasource_admin_settings ) texts = cf7_datasource_admin_settings['sql_generator_texts'];
				}
				generator = new CF7DSSQLQueryGenerator( db_prefix, texts );
			}
		};

		$(document).on('click', '#cf7-ds-sql-generator-icon', function(){
			init();
			$('.cf7-ds-sql-generator-modal').show();
		});

		$(document).on('click', '#cf7-ds-close-generator-dialog', function(){
			$('.cf7-ds-sql-generator-modal').hide();
		});

		$(document).on('click', '#cf7-ds-generate-query', async function(){
			if ( generator ) {
				let btn = $(this);
				btn.prop('disabled', true)
					.removeClass('button-primary')
					.addClass('button-secondary');

				if( typeof cf7_datasource_admin_settings != 'undefined' && 'sql_generator_button_texts' in cf7_datasource_admin_settings ) {
					btn.text(cf7_datasource_admin_settings.sql_generator_button_texts.inactive);
				}

				let queryContainer = $('#cf7-ds-generated-query');
				try {
					query = await generator.generateQuery( $('#cf7-ds-generator-query-description').val(), queryContainer[0] );
				} catch( err ) {
					alert( err );
				}
				btn.prop('disabled', false)
					.removeClass('button-secondary')
					.addClass('button-primary');

				if( typeof cf7_datasource_admin_settings != 'undefined' && 'sql_generator_button_texts' in cf7_datasource_admin_settings ) {
					btn.text(cf7_datasource_admin_settings.sql_generator_button_texts.active);
				}
			}
		});

		$(document).on('click', '#cf7-ds-generator-use-query', function(){
			if ( generator && generator.getIsProcessing() ) {
				alert(generator.getTexts()['in_progress']);
				return;
			}

			if ( query.length ) {
				$('[name="cf7-database-query"]').val( query ).trigger( 'update-codemirror' );
			}
			$('#cf7-ds-close-generator-dialog').trigger('click');
		});

		$(document).on('click', '#cf7-ds-generator-test-query', function(){
			if ( query.length ) {
				let recordset = '[cf7-recordset id="cf7-ds-generator" type="database" query="' + esc( query ) + '"]'
				$.ajax(
					{
						'url'       : document.location.href,
						'method'    : 'post',
						'dataType'  : 'json',
						'data'      : {'cf7-recordset-test' : recordset},
						'success'   : function(data){
							try
							{
								alert(JSON.stringify(data));
							}
							catch(err){if('console' in window) console.log(err);}
						}
					}
				);
			}
		});
	}
})()