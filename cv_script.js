window.addEventListener("load", () => {
  const intervalDuration = 1000;
  let direction = 5;
  let imgObj = null;

  function init() {
    imgObj = document.querySelector("#catimage");
    if (!imgObj) {
      console.error("Image with id 'catimage' not found.");
      return;
    }
    imgObj.style.position = "absolute";
    imgObj.style.left = "0px";
    console.log("screen: " + screen.width + " " + screen.height);
    console.log("window: " + window.innerWidth + " " + window.innerHeight);
    setInterval(updateImagePosition, intervalDuration);
  }

  function updateImagePosition() {
    let stringLeft = imgObj.style.left;
    if (!stringLeft || stringLeft === "") {
      stringLeft = "0px";
    }
    console.log("stringleft: " + stringLeft);
    const substr = stringLeft.substring(0, stringLeft.length - 2);
    console.log("substr: " + substr);
    imgObj.style.left = parseInt(substr) + direction + "px";
  }

  init();
});
