var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-26372393-2']);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function param(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

var bgPage  = chrome.extension.getBackgroundPage();
var PEjs    = chrome.tabs.connect(parseInt(param('tabID')));

$("#playerControlContainer > div, #playerControlContainer > div img").live('click', function(){
    var action = $(this).prop("id");
    switch (action)
    {
        case "thumbs_up":
        if(!$("#thumbs_up").hasClass('isLiked'))
        {
            $("#thumbs_up").addClass('isLiked');
            $("#thumbs_up").removeClass('playerControl');
            bgPage.window.playerControl("thumbs_up");
        }
        break;
        case "thumbs_down":
            bgPage.window.playerControl("thumbs_down");
            break;
        case "play":
            $(this).hide();
            $("#pause").show();
            bgPage.window.playerControl("play", false);
            break;
        case "pause":
            $(this).hide();
            $("#play").show();
            bgPage.window.playerControl("pause");
            bgPage.window.updateNotificationStayOpen('songChange', true);
            break;
        case "skip":
            bgPage.window.playerControl("skip");
            break;
        case "mute":
            $(this).hide();
            $("#unmute").show();
            bgPage.window.playerControl("mute");
            break;
        case "unmute":
            $(this).hide();
            $("#mute").show();
            bgPage.window.playerControl("unmute");
            break;
    }
});

$(document).ready(function()
{
    //listener
    PEjs.onMessage.addListener(function(message){
        if (message.timeInfo)
        {
            var elapsedTime     = message.timeInfo.elapsedTime;
            var remainingTime   = message.timeInfo.remainingTime; //unused right now
            var totalTime       = message.timeInfo.totalTime; //sometimes this is wrong, causing the tracking bar to freak out for an interval. wtf?
            var trackingPercent = (elapsedTime / totalTime) * 100;
            $("#tracking").css("width", trackingPercent + "%");
        }

        if (message.stationList)
        {
            if (message.stationList !== null)
            {
                console.log(message.stationList);
                $.each(message.stationList, function(index, value){
                    var selected = (index == "selected") ? "selected" : "";
                    //$("#station_listing").css("display", "block").append('<option ' + selected + '>' + value + '</option>');
                    $(".station_list dd ul").append('<li><a href="#">' + value + '</a></li>');
                });
            }
        }
    });
    
    //get some info
    setInterval(function(){
        PEjs.postMessage({getTimeInfo: true});
    }, 1500);
    PEjs.postMessage({getStationList: true});
    
    /* old station list
    $("#station_listing").change(function(){
        var stationName = $(this).val();
        var index = $(this).prop("selectedIndex");
        PEjs.postMessage({changeStation: stationName});
    });
    */
    
    $(".station_list dt a").click(function(){
        $(".station_list dd ul").toggle();
    });

    $(".station_list dd ul li a").live('click', function(){
        var stationName = $(this).html();
        PEjs.postMessage({changeStation: stationName});
        $(".station_list dd ul").hide();
    });
    
    if(param('isLiked') == "true")
        {
        $("#thumbs_up").addClass('isLiked');
        $("#thumbs_up").removeClass('playerControl');
    }

    if (param('autoMute') && param('autoMute') == "true" && param('songName') == "Audio Ad")
        {
        bgPage.window.setAudioAdStatus(true);
        bgPage.window.playerControl("mute");
    } else {
        if (bgPage.window.getAudioAdStatus())
            bgPage.window.playerControl("unmute");

        bgPage.window.setAudioAdStatus(false);
    }

    $('#notificationContainer').mouseenter(function(event){
        bgPage.window.updateNotificationStayOpen('songChange', true);
    }).mouseleave(function(){
        if($("#pause").css('display') != 'none')
            {
            bgPage.window.updateNotificationStayOpen('songChange', false);
        }
    });
    
    _gaq.push(['_trackPageview']);

});