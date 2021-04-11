$('#manifest_verion').html(chrome.runtime.getManifest().version);
$(document).attr("title", chrome.runtime.getManifest().name+" - Configurations");
$(document).ready(function() {
    $('#add_account').click(function() { validate_login(); });
    $('#doTest_media').click(function(){ doTest(); });
    $("#display_name, #auth_user, #sip_password, #sip_server, #wss_server").keypress(function(event){
        if(event.which == 13){ validate_login(); }
    });
    $('#remove_account').click(function(){ doLogout(); });                                                                                                                                                                               
    let requiredKeys = ['EXTENSION_NUMBER', 'DISPLAY_NAME', 'PASSWORD', 'SERVER', 'WSS_SERVER', 'IS_LOGIN'];
    chrome.storage.sync.get(requiredKeys, function(_data) {
        if(_data.IS_LOGIN=="1" && !isEmpty(_data.IS_LOGIN)){                                                                                                                    
            $('#user_display_name').html(_data.DISPLAY_NAME);                                                                                                                      
            $('#user_auth_name').html(_data.EXTENSION_NUMBER);                                                                                                          
            $('#user_sip_server').html(_data.SERVER); 
            $('#user_wss_server').html(_data.WSS_SERVER);       
            $('#login').css('display','none');                                                                                                                                
            $('#user_detail').css('display','block');
        } else {
            let requiredKeys = ['_login_sip_server', '_login_sip_user', '_login_sip_password', '_login_display_name', '_login_wss_server'];
            chrome.storage.sync.get(requiredKeys, function(_login_data) {
                if(!isEmpty(_login_data._login_sip_server)){
                        $('#sip_server').val(_login_data._login_sip_server);
                }
                if(!isEmpty(_login_data._login_sip_user)){
                        $('#auth_user').val(_login_data._login_sip_user);
                }
                if(!isEmpty(_login_data._login_sip_password)){
                        $('#sip_password').val(_login_data._login_sip_password);
                }
                if(!isEmpty(_login_data._login_display_name)){
                        $('#display_name').val(_login_data._login_display_name);
                }
                if(!isEmpty(_login_data._login_wss_server)){
                        $('#wss_server').val(_login_data._login_wss_server);
                }
            });
        }
        doTest();
    });
});
let validate_login = () => {
    let display_name = $('#display_name').val().trim();
    let auth_user = $('#auth_user').val().trim();
    let sip_password = $('#sip_password').val().trim();
    let sip_server = $('#sip_server').val().trim();
    let wss_server = $('#wss_server').val().trim();
    
    let _status = '';
    if(!isEmpty(display_name) && !isEmpty(auth_user) && !isEmpty(sip_server) && !isEmpty(wss_server)){
        let extension_configuration = {
            SERVER : sip_server,
            EXTENSION_NUMBER : auth_user,
            DISPLAY_NAME : display_name,
            PASSWORD : sip_password,
            WSS_SERVER : wss_server,
            IS_LOGIN : 1,
            _login_sip_server : sip_server,
            _login_sip_user : auth_user,
            _login_sip_password : sip_password,
            _login_display_name : display_name,
            _login_wss_server : wss_server
        }
        chrome.storage.sync.set(extension_configuration);
        chrome.runtime.sendMessage({action:'change_config'});
        chrome.runtime.sendMessage({action:'MyPhone_Register'});
        location.reload();
    } else {
        _status = '<div class="alert alert-danger fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="fa fa-times"></i></button>Fill all required details.</div>';
        updateDeleteCount(_status,"statusMsg");
    }
}
let microphone;
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "change_config") {
                location.reload();
        }
    }
);

function doTest(errorCallback, successCallback) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({
        audio: true,
        video: true
    }, function(stream) {
        $("#doTest_media").removeClass("text-danger").addClass("text-success");
        //Solve issue of cursor pointer when Media is allowed
        $("#doTest_media").css('cursor','default');
        $('#doTest_media').html("Allowed.");
        stream.getAudioTracks()[0].stop();
        stream.getVideoTracks()[0].stop();
    }, function(error) {
        if(error.name=="PermissionDeniedError"){
            console.error('['+chrome.runtime.getManifest().name+'] : You have blocked access of audio/video devices.');
        }
        console.log(error);
    });
}

function doLogout()
{
    let extension_configuration = [
            'SERVER',
            'EXTENSION_NUMBER',
            'DISPLAY_NAME',
            'PASSWORD',
            'WSS_SERVER',
            'IS_LOGIN'
    ];
    chrome.storage.sync.remove(extension_configuration);
    chrome.runtime.sendMessage({action:'change_config'});
    chrome.runtime.sendMessage({action:'MyPhone_unRegister'});
    location.reload();
}

// to display flash message after ajax deletion
function updateDeleteCount(data, id)
{
    $("#"+id).html('').show();
    $("#"+id).html(data).animate({opacity: 1.0}, 3000).fadeOut("slow");
}

function isEmpty(data){
    if(data == null || data == "" || data == undefined){
            return true;
    } else {
            return false;
    }
}