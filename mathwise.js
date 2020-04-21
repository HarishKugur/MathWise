window.addEventListener('load', () => {
    const myscriptMathWebElement = document.querySelector('myscript-math-web');
    const gestureElement = document.getElementById('editor2');
    var outputWindow = document.querySelector('#tab .resultFormat');
    outputWindow.innerHTML = "Result Window";
    myscriptMathWebElement.export_();

    var toast = document.getElementById("latexcontent");
    const myImgSrc = document.querySelector('#tab #myImgSrc');
    const loader = document.querySelector('#tab .loader');
    const loaderMessage = document.querySelector('#tab .loaderMessage');
    const mathMessage = document.querySelector('.write-here');
    const gestureMessage = document.querySelector('.gesture-here');
    const recognitionMessage = document.querySelector('.recognition-here');
    const helpButton = document.querySelector('.spin');


    function parseResponse(apiResponse) {

        var test = apiResponse;

        var textResult, imageResult;
        var equationType = 'Default';
        var podIndex = 0;

        if (test.queryresult.pods[0].title == "Indefinite integral") {
            equationType = 'Integral';
        }
        else if (test.queryresult.numpods > 4 && test.queryresult.pods[4].id == "AlternateForm") {
            equationType = "Formula";
            if (test.queryresult.pods[5].id == "ExpandedForm") {
                podIndex = 5;
            }
            else {
                podIndex = 4;
            }
        }
        else if (test.queryresult.numpods === 4 && test.queryresult.pods[1].title === "Solution" && test.queryresult.pods[1].scanner === "Reduce") {
            equationType = 'Linear';
        }
        else if (test.queryresult.numpods === 3 && test.queryresult.pods[1].title === "Solution" && test.queryresult.pods[1].scanner === "Reduce") {
            equationType = 'Linear';
        }
        else if (test.queryresult.numpods > 3 && (test.queryresult.pods[3].title == "Roots" || test.queryresult.pods[3].title == "Complex roots")) {
            equationType = "Quadratic";
            podIndex = 3;
        }
        else if (test.queryresult.numpods > 3 && test.queryresult.pods[3].title === "Geometric figure" && test.queryresult.pods[5].title === "Complex roots") {
            equationType = "Edge Quadratic";
            podIndex = 5;
        }

        /**Handling Code */

        if (equationType === 'Integral') {
            imageResult = test.queryresult.pods[0].subpods[0].img.src;
            myImgSrc.src = imageResult;
            toast.style.display = "none";
        }
        else if (equationType === "Formula") {
            toast.textContent = test.queryresult.pods[podIndex].subpods[0].plaintext;
            toast.style.display = "block";
        }
        else if (equationType === 'Linear') {
            toast.style.display = "block";
            textResult = test.queryresult.pods[1].subpods[0].plaintext;
            toast.textContent = textResult;
        }
        else if (equationType === "Quadratic" || equationType === "Edge Quadratic") {
            var root1Img, root2Img;
            toast.style.display = "none";
            root1 = test.queryresult.pods[podIndex].subpods[0].plaintext;
            root1Img = test.queryresult.pods[podIndex].subpods[0].img;

            if (test.queryresult.pods[podIndex].numsubpods == "2") {
                root2 = test.queryresult.pods[podIndex].subpods[1].plaintext;
                root2Img = test.queryresult.pods[podIndex].subpods[1].img;

            }
            toast.style.display = "inline-block";
            toast.textContent = root1 + ', ';
            toast.insertAdjacentHTML('beforeend', '<div class="toast1" id="two" style="display:inline-block; margin-top: -15px;">' + root2 + '</div>');
        }
        else {
            toast.style.display = "block";
            if (test.queryresult.pods[1].title === "Result") {
                textResult = test.queryresult.pods[1].subpods[0].plaintext;
                imageResult = test.queryresult.pods[1].subpods[0].img.src;
                toast.textContent = textResult;
            }
            else if (test.queryresult.pods[1].title === "Exact result") {

                if (test.queryresult.pods[1].scanner === "Simplification") {
                    textResult = test.queryresult.pods[1].subpods[0].plaintext;
                    imageResult = test.queryresult.pods[1].subpods[0].img.src;
                    toast.textContent = textResult;
                }
                else if (!test.queryresult.pods[2].title.includes("Decimal")) {
                    textResult = test.queryresult.pods[1].subpods[0].plaintext;
                    imageResult = test.queryresult.pods[1].subpods[0].img.src;
                    toast.textContent = textResult;
                }
                else {
                    textResult = parseFloat(test.queryresult.pods[2].subpods[0].plaintext).toFixed(4);
                    imageResult = test.queryresult.pods[2].subpods[0].imageResult;
                    toast.textContent = textResult;
                }
            }
            else if (test.queryresult.pods[1].title.includes("Decimal")) {
                textResult = parseFloat(test.queryresult.pods[1].subpods[0].plaintext).toFixed(4);
                imageResult = test.queryresult.pods[1].subpods[0].img.src;
                toast.textContent = textResult;
            }
        }
        loader.setAttribute('style', 'display:none');

    }

    function callbackFunction(response) {

        var response = JSON.parse(response);
        if (response.queryresult.success === true) {
            parseResponse(response);
        }
        else {
            loader.setAttribute('style', 'display:none');
            toast.textContent = "Oops! Something went wrong. Please try again.";
        }
    }

    function httpGetAsync(theUrl, callback) {

        var xmlHttp = new XMLHttpRequest();
        loader.setAttribute('style', 'display:block');
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                callback(xmlHttp.responseText);
            }
        }
        xmlHttp.open("POST", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }

    var latexExport1 = '';
    
    function clearAllViews() {
        toast.textContent = '';
        myImgSrc.src = '';
        outputWindow.innerHTML = "Result Window";
    }

    myscriptMathWebElement.addEventListener('exported', (evt) => {
        mathMessage.textContent = '';
        recognitionMessage.textContent = '';
        if (evt.detail.exports) {
            latexExport1 = evt.detail.exports['application/x-latex'] || '';
            clearAllViews();
        }
    });

    gestureElement.addEventListener('exported', (evt) => {
        gestureMessage.textContent = '';

        if (evt.detail.exports != undefined) {
            toast.textContent = '';
            myImgSrc.src = '';
            loaderMessage.style.display = "block";
        }
        else {
            return 0;
        }

        setTimeout(function () {

            if (evt.detail.exports) {
                const latexExport2 = evt.detail.exports['application/x-latex'] || '';

                console.log('Gesture -' + latexExport2);
                toast.style.display = "block";
                if (latexExport1 && latexExport2 === 'L') {
                    outputWindow.innerHTML = "Latex Format";
                    myImgSrc.src = '';
                    toast.textContent = latexExport1;
                }

                else if (latexExport2 === " <") {
                    myscriptMathWebElement.undo();
                }

                else if (latexExport2 === " >") {
                    myscriptMathWebElement.redo();
                }

                else if (latexExport2 === "R") {
                    myscriptMathWebElement.clear();
                    latexExport1 = '';
                    clearAllViews();
                }

                else if (latexExport1 && (latexExport2 === '=' || latexExport2 === 'S' || latexExport2 === 's')) {
                    outputWindow.innerHTML = "Solution";

                    var find = 'dfrac ';
                    var re = new RegExp(find, 'g');
                    var mathRecognizerOutput = latexExport1.replace(re, "dfrac");

                    if (mathRecognizerOutput.includes("\\begin")) {
                        mathRecognizerOutput = formatInput(mathRecognizerOutput);
                    }

                    const input = encodeURIComponent(mathRecognizerOutput);
                    toast.textContent = '';
                    myImgSrc.src = '';
                    httpGetAsync('https://api.wolframalpha.com/v2/query?input=' + input + '&appid=34TPUU-U2YKRG6HY8&output=json', callbackFunction);
                }
                else {
                    $(helpButton).trigger("click");
                    if (!latexExport1) {
                        toast.textContent = 'No equation detected';
                    }
                    else {
                        toast.textContent = 'Unrecognized Gesture';
                    }
                    outputWindow.innerHTML = "Result Window";
                    myImgSrc.src = '';
                }
                gestureElement.clear();
                loaderMessage.style.display = "none";
            }
        }, 500);
    });

    /**Display Help Icon animation on unrecognized gesture */

    $(helpButton).click(function () {
        var element = $(this);
        var tmpClass = element.attr('class');
        element.removeClass();
        setTimeout(function () {
            element.addClass(tmpClass).addClass('start-now');
        });
    });


    function formatInput(input) {
        /**formatting for linear equations */
        input = input.replace(/begin|{aligned}|end/g, "");
        input = input.replace(/\\/g, " ");
        input = input.split("  ");
        input = input.join(";");
        input = input.replace(/\s/g, '');
        return input;
    }

});
