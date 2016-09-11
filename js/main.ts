
        <script type="text/javascript">
        var appInsights=window.appInsights||function(config){
            function r(config){t[config]=function(){var i=arguments;t.queue.push(function(){t[config].apply(t,i)})}}var t={config:config},u=document,e=window,o="script",s=u.createElement(o),i,f;s.src=config.url||"https://az416426.vo.msecnd.net/scripts/a/ai.0.js";u.getElementsByTagName(o)[0].parentNode.appendChild(s);try{t.cookie=u.cookie}catch(h){}for(t.queue=[],i=["Event","Exception","Metric","PageView","Trace","Dependency"];i.length;)r("track"+i.pop());return r("setAuthenticatedUserContext"),r("clearAuthenticatedUserContext"),config.disableExceptionTracking||(i="onerror",r("_"+i),f=e[i],e[i]=function(config,r,u,e,o){var s=f&&f(config,r,u,e,o);return s!==!0&&t["_"+i](config,r,u,e,o),s}),t
        }({
            instrumentationKey:"bad3933c-6663-4087-8c79-198df65926f8"
        });
        
        window.appInsights=appInsights;
        appInsights.trackPageView();
    </script>
var text: any;
var confidence: any;
var image: any;
// var currentMood: Mood;

// Get elements from DOM
var pageheader = $("#page-header")[0]; //note the [0], jQuery returns an object, so to get the html DOM object we need the first item in the object
var pagecontainer = $("#page-container")[0]; 

// The html DOM object has been casted to a input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector : HTMLInputElement = <HTMLInputElement> $("#my-file-selector")[0]; 
var refreshbtn = $("#refreshbtn")[0]; //You dont have to use [0], however this just means whenever you use the object you need to refer to it with [0].

// Register button listeners
imgSelector.addEventListener("change", function () { // file has been picked
    pageheader.innerHTML = "Just a sec while we analyse your image...";
    processImage(function (file) { //this checks the extension and file
        // Get emotions based on image
        sendDescriptionRequest(file, function (description) { //here we send the API request and get the response
            // Find out most dominant emotion
            text = getCaption(description); //this is where we send out scores to find out the predominant emotion
            confidence = getConfidence(description);
            //confidence =confidence*100;
            changeUI(); //time to update the web app, with their emotion!



        });
    });
});


function processImage(callback) : void {
    var file = imgSelector.files[0];  //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    } else {
        console.log("Invalid file");
    }
    reader.onloadend = function (e) { 
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png)$/)){
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        } else {
            //if file is photo it sends the file reference back up
            callback(file);
            $(file).next('blah').attr('src', e.target.result);
            
        }
    }
}

function changeUI() : void {
    pageheader.innerHTML =  "I am " + (confidence*100).toPrecision(2) + "% sure that this is " + text;  //Remember currentMood is a Mood object, which has a name and emoji linked to it. 
    //Remove offset at the top
    //var img : HTMLImageElement = <HTMLImageElement>  $("#selected-img")[0];
    //pagecontainer.style.marginTop = "20px";
}

// Refer to http://stackoverflow.com/questions/35565732/implementing-microsofts-project-oxford-emotion-api-and-file-upload
// and code snippet in emotion API documentation
function sendDescriptionRequest(file, callback) : void {
    $.ajax({
        url: "https://api.projectoxford.ai/vision/v1.0/describe",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "e00f59ebae924020ac6a6478edf0f92e");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
            var description = data.description;
            callback(description);

        })
        .fail(function (error) {
            pageheader.innerHTML = "Sorry, something went wrong. :( Try again in a bit?";
            console.log(error.getAllResponseHeaders());
        });
}



function getCaption(description : any) : any {
    return description.captions[0].text;
}
function getConfidence(description : any) : any {
    return description.captions[0].confidence;
}