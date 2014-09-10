/*function Facebook() {

    

}*/
window.fbAsyncInit = function() {
    FB.init({
        appId      : '812894278755270',
        xfbml      : true,
        version    : 'v2.0'
    });

/*    function openFbPopUp() {
        var points = "109";
        FB.ui(
            {
                method: 'feed',
                name: 'FREE FALL',
                link: 'http://37.157.0.158/game/',
                picture: window.location + '/assets/images/logo.png',
                caption: 'Free fall page dot com',
                description: ' Points collected: ' + points
            },
            function(response) {
                if (response && response.post_id) {
                    //alert('Post was published.');
                } else {
                    //alert('Post was not published.');
                }
            }
        );
    }*/

};