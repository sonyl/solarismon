// Wrap everything in a function
(function(i) {
    var msg = JSON.parse(i);
    var date = msg.date ? new Date(msg.date) : new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());  
    return date.toISOString();  
})(input)
// input variable contains data passed by openhab