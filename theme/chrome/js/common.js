chrome.runtime.sendMessage({action:'call_status'}, function(response) {});
let requiredKeys = ['IS_LOGIN','EXTENSION_NUMBER', 'DISPLAY_NAME', 'SERVER'];
chrome.storage.sync.get(requiredKeys, function(_data) {
    if(_data.IS_LOGIN !="1" && isEmpty(_data.IS_LOGIN)){
      chrome.tabs.create({
        'url': 'chrome-extension://' + chrome.runtime.id + '/config.html'
    }, function(tab) {
        console.log("New tab launched for install...");
    });
    } else {
        ext_details = _data;
        resetCallAssistantConfiguration();
        $("#user_ext_num").html('&nbsp;'+_data.DISPLAY_NAME);
        $('.sip_uri').html(_data.EXTENSION_NUMBER+'@'+_data.SERVER);
        console.log('login successfully');
    }
});


let isNumberKey = (evt) => {
	let charCode = (evt.which) ? evt.which : event.keyCode;
	if (charCode > 31 && (charCode < 48 || charCode > 57))
	    return false;
	return true;
}

$('body').on('click','.logout',function(r){
    chrome.tabs.create({
    'url': 'config.html'
    }, function(tab) {
    console.log("New tab launched for install...");
    });
});

$('#phone_number').bind("cut copy paste",function(e) {
    e.preventDefault();
});

$('#phone_number').keypress(function(evt)
{
	let charCode = (evt.which) ? evt.which : event.keyCode;
	if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode!=42 && charCode!=35)
		return false;
	else
		return true;
	   
});

function resetCallAssistantConfiguration(){
    const requiredKeys = ['CA_AUTO_ANSWER', 'CA_DND'];
	chrome.storage.sync.get(requiredKeys, function(_data) {
    if(_data.CA_AUTO_ANSWER=='1') {
        $('.auto_answer').prop('checked', true);
    } else {
        $('.auto_answer').prop('checked', false);
    }
    if(_data.CA_DND=='1') {
        $('.do_not_disturb').prop('checked', true);
    } else {
        $('.do_not_disturb').prop('checked', false);
    }
    });
}

let isEmpty = (data) => {
	if(data == null || data == "" || data == undefined){
		return true;
	} else {
		return false;
	}
}

$('body').on('click','.dialpad_btn',function(r){
    $("#phone_number").val($('#phone_number').val() + $(this).attr("data-dialpad"));
});

$('body').on('click','.clear_number',function(r){
    let yourString = $('#phone_number').val(); 
    let result = yourString.substring(0, yourString.length-1);
    $('#phone_number').val(result);
});

$('#call_assistant').on('hide.bs.modal', function (e) {
    resetCallAssistantConfiguration();
})

$('body').on('click','.save_call_assitant',function(r){
    let auto_answer = ($('.auto_answer').is(":checked"))?'1':'0';
    let do_not_disturb = ($('.do_not_disturb').is(":checked"))?'1':'0';
    let call_assitant = {
        CA_AUTO_ANSWER : auto_answer,
        CA_DND : do_not_disturb
    }
    chrome.storage.sync.set(call_assitant);
    chrome.runtime.sendMessage({action:'save_call_assitant'});
    $('#call_assistant').modal('hide');
});

$('body').on('click','.doCall',function(e){
	let phone_number = $('#phone_number').val();
	if(!isEmpty(phone_number) && phone_number.length > 1){
        if(checkOnlineUser()){
            chrome.runtime.sendMessage({action:"doCall",ext_num : phone_number, video : $(this).attr('data-video')});
            $('#phone_number').val('');
        } else {
            showDisplayErrorNotification('You are not registered.');
        }
	} else {
            showDisplayErrorNotification('Phone number should be minimum 2 characters.');
    }
});

let checkOnlineUser = () => {
    return ($('#register').hasClass("registered"))? true : false;
}

let showDisplayErrorNotification = (msg) => {
    let options = {
        type: "basic",
        iconUrl: "ext_icons/logo.png",
        title: chrome.runtime.getManifest().name,
        message: msg,
        priority: 1,
        isClickable: false
    };
    chrome.notifications.create("showDisplayErrorNotification", options, function() {});
    setTimeout(function(){
        chrome.notifications.clear("showDisplayErrorNotification");
    }, 2000);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "ua_status") {
            if(request.status==="registered"){
            $("#register").css('color','green');
            $("#register").addClass('registered').removeClass('unregistered');
            $(".register_status").html('Registered');
            } else {
            $("#register").css('color','#E77373');
            $("#register").addClass('unregistered').removeClass('registered');
            $(".register_status").html('Not Registered');
            }
        }
    }
);