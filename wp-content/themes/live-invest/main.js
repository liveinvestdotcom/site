function getData(jsonForm) {
  var el = document.querySelector(jsonForm);
  var inputs = el.querySelectorAll("input,select,textarea");

  var data = {};
  for (var i = 0; i < inputs.length; i++) {
    switch (inputs[i].type) {
      case "file":
        var file = inputs[i].files[0];
        if (file) {
          var oReader = new FileReader();
          (function (i) {
            oReader.onload = function (e) {
              data[inputs[i].name] = e.target.result;
              alert(JSON.stringify(data));
              document.querySelector("p").innerHTML = JSON.stringify(data);
              console.dir(data);
            };
            oReader.readAsDataURL(file);
          })(i);
        }

        break;
      case "checkbox":
        data[inputs[i].name] = inputs[i].checked;
        break;
      default:
        data[inputs[i].name] = inputs[i].value;
    }
  }
  document.querySelector("p").innerHTML = JSON.stringify(data);
}

window.addEventListener("load", function (ev) {
  var hamburger = document.querySelector(".hamburger");
  var mobileNav = document.querySelector(".mobile-nav");
  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("is-active");
    mobileNav.classList.toggle("is-active");
    document.querySelector("html").classList.toggle("locked");
    document.querySelector("body").classList.toggle("locked");
  });
});

window.addEventListener("load", function (ev) {
  var project_input = document.querySelector('[name="project_id"]');
  // console.log(project_input);
  if (project_input) {
    project_input.value = project_id;
  }
  // page_url
  var page_url = document.querySelector('[name="page_url"]');
  // console.log(page_url);
  if (page_url) {
    page_url.value = window.location.href;
  }

  var project_input = document.querySelector('[name="project"]');
  // console.log(page_url);
  if (project_input) {
    project_input.value = project;
  }
});

Array.prototype.hasMin = function (attrib) {
  const checker = (o, i) => typeof o === "object" && o[i];
  return (
    (this.length &&
      this.reduce(function (prev, curr) {
        const prevOk = checker(prev, attrib);
        const currOk = checker(curr, attrib);
        if (!prevOk && !currOk) return {};
        if (!prevOk) return curr;
        if (!currOk) return prev;
        return prev[attrib] < curr[attrib] ? prev : curr;
      })) ||
    null
  );
};

Array.prototype.hasMax = function (attrib) {
  const checker = (o, i) => typeof o === "object" && o[i];
  return (
    (this.length &&
      this.reduce(function (prev, curr) {
        const prevOk = checker(prev, attrib);
        const currOk = checker(curr, attrib);
        if (!prevOk && !currOk) return {};
        if (!prevOk) return curr;
        if (!currOk) return prev;
        return prev[attrib] > curr[attrib] ? prev : curr;
      })) ||
    null
  );
};
