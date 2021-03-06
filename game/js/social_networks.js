window.fbAsyncInit = function() {
    FB.init({
        appId      : '812894278755270',
        xfbml      : true,
        version    : 'v2.0'
    });
};

function openFbPopUp(score) {
    if (window["FB"] !== undefined) {
        FB.ui(
            {
                method: 'feed',
                name: 'FREE FALL',
                link: 'http://rm.adform.com/students/freefall',
                picture: window.location + 'assets/images/logo.png',
                caption: 'Points collected: ' + score,
                description: 'FREE FALL - features challenging physics-based gameplay and hours of replay value. Get ready for an epic falling journy in SPACE. Avoid rocks and magnets, try to get as much points as you can, but remember the further you go, the faster it gets! MORE COMING SOON! STAY TUNED!'
            },
            function(response) {
                if (response && response.post_id) {
                    //alert('Post was published.');
                } else {
                    //alert('Post was not published.');
                }
            }
        );
    } else {
        alert("You are not connected to the internet. :( ");
    }
}