chrome.runtime.onInstalled.addListener(() => {
	console.log('onInstalled addListener');
});

let auto_answer = '0';
let do_not_disturb = '0';
let sip_uri, sip_password, ws_servers, display_name, sip_server;

$(document).ready(function(){
    check_init_conf();
});

let check_init_conf = () => {
	console.log('checking init conf ', new Date());
    const requiredKeys = ['EXTENSION_NUMBER', 'DISPLAY_NAME', 'PASSWORD','SERVER','WSS_SERVER','CA_AUTO_ANSWER', 'CA_DND'];
    chrome.storage.sync.get(requiredKeys, function(_data) {
            sip_uri ="sip:"+_data.EXTENSION_NUMBER+"@"+_data.SERVER; 
            sip_password =_data.PASSWORD;
            ws_servers = _data.WSS_SERVER;
            display_name = _data.DISPLAY_NAME;
            sip_server = _data.SERVER;
            auto_answer = _data.CA_AUTO_ANSWER;
            do_not_disturb = _data.CA_DND;
            if(!isEmpty(_data.EXTENSION_NUMBER) && !isEmpty(_data.SERVER) && !isEmpty(_data.WSS_SERVER) && !isEmpty(_data.DISPLAY_NAME) ){
                    setTimeout(function () { phone.createUA(); },10); 
            } else {
                    setTimeout(function(){ check_init_conf(); },1000);
            }
    });
}

chrome.runtime.onMessage.addListener(function(request) {
    console.log(request);
	if(request.action === 'save_call_assitant'){
        check_call_assistant();
    }
    if(request.action === 'call_status') {
    	chrome.runtime.sendMessage({action:'ua_status', status: getUAStatus()}); 
    }
    if(request.action === 'doCall') {
    	phone.dial(request.ext_num, request.video);
    }
    if(request.action == 'acceptCall') {
        phone.answer(request._sessionId, request._video);
    }
    if(request.action == 'hangup' || request.action == 'cancelCall') {
    	phone.hangup(request._sessionId);
    }
    if(request.action == 'sendDTMF') {
    	phone.sendDTMF(request._sessionId, request._dtmf);	
    }
    if(request.action == 'toggleHold') {
    	phone.toggleHold(request._sessionId, request._state);
    }
    if(request.action == 'toggleMute') {
    	phone.toggleMute(request._sessionId, request._state);
    }
    if(request.action === 'MyPhone_unRegister') {
            UA.transport.disconnect();
            UA.unregister();
            UA.stop();
            UA = null;
            chrome.browserAction.setTitle({
                title : chrome.runtime.getManifest().name
            });
            chrome.browserAction.setBadgeText({text:''}, function(response) { console.info(response);});
    }
    if(request.action === 'MyPhone_Register') {
        check_init_conf();
    }
});

let getUAStatus = () => {
	try {
		if(UA && UA.isRegistered()) {
			return 'registered';
		} else {
			return 'unregisterd';	
		}
	} catch(e) {
		return 'unregisterd';
	}
}

let check_call_assistant = () => {
    const requiredKeys = ['CA_AUTO_ANSWER', 'CA_DND'];
    chrome.storage.sync.get(requiredKeys, function(_data) {
        auto_answer = _data.CA_AUTO_ANSWER;
        do_not_disturb = _data.CA_DND;
    });
}

let notify = (_msg, _title) => {
	const options = {
	    type: "basic",
	    iconUrl: "ext_icons/logo.png",
	    title: chrome.runtime.getManifest().name,
	    message: _msg,
	    priority: 1,
	    isClickable: false
	};
	chrome.notifications.create("showDisplayErrorNotification", options, function() {});
	setTimeout(function(){
	        chrome.notifications.clear("showDisplayErrorNotification");
	}, 2000);
}