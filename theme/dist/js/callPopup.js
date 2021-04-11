let displayName = '';
let fromNumber = '';
let _sessionId = '';
let callAccepted = false;
$(function() {
    $(document).attr("title", chrome.runtime.getManifest().name);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        if (request.action == "outgoingCallPopup") {
            fromNumber = request.from;
            displayName = request.displayName;
            _sessionId = request._sessionId;
            if (request.callDirection == 'incoming') {
                $('.answerCallState').show();
                $('.qbLocalvideo').hide();
                $('.call_state_status').html('Incoming call from ' + displayName + ' (' + fromNumber + ')');
            } else if (request.callDirection == 'outgoing') {
                $('.call_state_status').html('Dialing ' + displayName + ' (' + fromNumber + ')');
                $('.answerCallState').hide();
                $('.qbLocalvideo').show();
            }
            callAccepted = false;
        }
        if (request.action == "callAccepted") {
            $('.qbLocalvideo').show();
            timer();
            onCallState();
            callAccepted = true;
        }
        if (request.action == "ended_call") {
            $('.call_state_status').html('Reason : ' + request.cause);
            $('.answerCallState').hide();
            $('.cancelCallState').hide();
            $('.twt-footer').hide();
            setTimeout(function() {
                window.close();
            }, 3000);
            callAccepted = false;
        }
        if (request.action == "terminated_call") {
            window.close();
            callAccepted = false;
        }
        return true;
    }
);
let onCallState = () => {
    $('.cancelCallState').hide();
    $('.twt-footer').css('display', 'block');
    $('.call_state_status').html('Talking to ' + displayName + ' (' + fromNumber + ')');
}

$(document).ready(function() {
    $('.twt-footer').hide();
});

$('#muteCall').click(function() {
    muteCall();
});

$('#unmuteCall').click(function() {
    unmuteCall();
});

$('#hangupCall').click(function() {
    hangupCall();
});

$('#holdCall').click(function() {
    holdCall();
});

$('#unholdCall').click(function() {
    unholdCall();
});

$('#dialpad').click(function() {
    openDialpad();
});

$('#transfer_call').click(function() {
    openTransferBox();
});

$('#transfer_button').click(function() {
    transfer_call();
});

$('.dtmtBtn').click(function(e) {
    let _dtmf = $(this).attr('data-val');
    chrome.runtime.sendMessage({
        action: "sendDTMF",
        _dtmf: _dtmf,
        _sessionId: _sessionId  
    });
});
$('#cancelCallState').click(function() {
    chrome.runtime.sendMessage({
        action: "cancelCall",
        _sessionId: _sessionId
    });
    window.close();
});
$('#answerCallState').click(function() {
    chrome.runtime.sendMessage({
        action: "acceptCall",
        _sessionId: _sessionId,
        _video: false
    });
    $('.answerCallState').hide();
    $('.cancelCallState').hide();
});
$('#videoCallState').click(function() {
    chrome.runtime.sendMessage({
        action: "acceptCall",
        _sessionId: _sessionId,
        _video: true
    });
    $('.answerCallState').hide();
    $('.cancelCallState').hide();
});
let openDialpad = () => {
    if ($('#dtmf_box').css('display') == 'none') {
        $('.call_state_status').css('display', 'none');
        $('#transfer_box').css('display', 'none');
        $('#dtmf_box').css('display', 'block');
    } else {
        $('#dtmf_box').css('display', 'none');
        $('#transfer_box').css('display', 'none');
        $('.call_state_status').css('display', 'block');
    }
}
let openTransferBox = () => {
    if ($('#transfer_box').css('display') == 'none') {
        $('#transfer_box').css('display', 'block');
        $('#dtmf_box').css('display', 'none');
        $('.call_state_status').css('display', 'none');
    } else {
        $('#transfer_box').css('display', 'none');
        $('#dtmf_box').css('display', 'none');
        $('.call_state_status').css('display', 'block');
    }
}
let muteCall = () => {
    chrome.runtime.sendMessage({
        action: "toggleMute",
        _state: "mute",
        _sessionId: _sessionId
    });
    
    $('#muteCall').css('display', 'none');
    $('#unmuteCall').removeAttr('style');
}
let unmuteCall = () => {
    chrome.runtime.sendMessage({
        action: "toggleMute",
        _state: "unmute",
        _sessionId: _sessionId
    });
    
    $('#muteCall').removeAttr('style');
    $('#unmuteCall').css('display', 'none');
}
let hangupCall = (id) => {
    chrome.runtime.sendMessage({
        action: "hangup",
        _sessionId: _sessionId
    });
    window.close();
}
let holdCall = () => {
    chrome.runtime.sendMessage({
        action: "toggleHold",
        state: 'hold',
        _sessionId: _sessionId
    });
    $('#holdCall').css('display', 'none');
    $('#unholdCall').removeAttr('style');
}
let unholdCall = () => {
    chrome.runtime.sendMessage({
        action: "toggleHold",
        state: 'unhold',
        _sessionId: _sessionId
    });
    $('#unholdCall').css('display', 'none');
    $('#holdCall').removeAttr('style');
}

let transfer_call = () => { 
    let trans_to = $('#trans_to').val();
    if (!isEmpty(trans_to)) {        
        $('#trans_to').val('');
        chrome.runtime.sendMessage({
            transfer_call: "transfer_call",
            to: trans_to
        });
    } else {
        console.warn("Enter destination number for transfer call");
    }
}
let isEmpty = (data) => {
    if (data == null || data == "" || data == undefined) {
        return true;
    } else {
        return false;
    }
}

let timer = () => {
    add_time();
    setInterval(add_time, 1000);
}
let hours = 0;
let seconds = 0;
let minutes = 0;
let active_call_duration = "";
let add_time = () => {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    active_call_duration = (hours ? ((hours > 9 ? hours : "0" + hours) + " : ") : "") + (minutes > 9 ? minutes : "0" + minutes) + " : " + (seconds > 9 ? seconds : "0" + seconds);
    $('#active_call_duration').html(active_call_duration);
}

$("#trans_to").keypress(function(event) {
    return isNumberKey(event);
});

let isNumberKey = (evt) => {
    let charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

window.onbeforeunload = function(event) {
    if (callAccepted) {
        $('#hangupCall').trigger('click');
    } else {
        $('#cancelCallState').trigger('click');
    }
};