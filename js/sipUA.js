let UA, _sessions = {}, callPopupWindow;
let soundPlayer = new Audio();
soundPlayer.volume = 1;

window.phone = {
	createUA : () => {
		let sipJSSettings = {
			// uri: 'sip:1298103@pbx.hodusoft.com',
			// uri: 'sip:ghanshyam01@acessopoint.voip.sufficit.com.br',
			uri: sip_uri,
			// password: '123456',
	        password: sip_password,
	        allowLegacyNotifications: true,
	        transportOptions: {
	            // wsServers: ['wss://pbx.hodusoft.com:7443'],
	            wsServers: [ws_servers],
	            traceSip: true,
	            maxReconnectionAttempts: 300
	        },
	        sessionDescriptionHandlerFactoryOptions: {
	            peerConnectionOptions: {
	                iceCheckingTimeout: 5000,
	                rtcConfiguration: {
	                    iceTransportPolicy: 'all',
	                    iceServers:[],
	                    iceServers: [{
	                        urls: 'stun:stun.l.google.com:19302'
	                    }]
	                }
	            }
	        },
	        displayName: display_name,
	        authorizationUser: null,
	        register: true,
	        rel100: 'SIP.C.supported.SUPPORTED',
	        // noAnswerTimeout: null,
	        stunServers: null,
	        turnServers: null,
	        usePreloadedRoute: null,
	        hackWssInTransport:true,
	        connectionRecoveryMinInterval: null,
	        connectionRecoveryMaxInterval: null,
	        hackViaTcp: null,
	        hackIpInContact: null,
	        userAgentString: chrome.runtime.getManifest().name+" "+chrome.runtime.getManifest().version,
	        registrarServer: null
		}

		UA = new SIP.UA(sipJSSettings);
		UA.on('connecting', () => {
		    console.warn('Connecting (Unregistered)');
		    chrome.browserAction.setTitle({
                title : "Connecting (Unregistered)"
            });
            chrome.browserAction.setBadgeBackgroundColor({color : '#FFFF00'}, function(response){ console.info(response) });
            chrome.browserAction.setBadgeText({text:' '}, function(response) { console.info(response);});
            chrome.runtime.sendMessage({
	            action: 'ua_status',
	            status: "connecting"
	        });
		});
		UA.on('connected', () => {
		    console.warn('Connected (Unregistered)');
		    chrome.browserAction.setTitle({
                title : "Connected (Unregistered)"
            });
            chrome.browserAction.setBadgeBackgroundColor({color : '#FFFF00'}, function(response){ console.info(response) });
            chrome.browserAction.setBadgeText({text:' '}, function(response) { console.info(response);});

            chrome.runtime.sendMessage({
	            action: 'ua_status',
	            status: "connected"
	        });
		});
		UA.on('disconnected', () => {
		    console.warn('Disconnected (Unregistered)');
            chrome.browserAction.setTitle({
                title : chrome.runtime.getManifest().name
            });
            chrome.browserAction.setBadgeText({text:''}, function(response) { console.info(response);});

            chrome.runtime.sendMessage({
	            action: 'ua_status',
	            status: "unregistered"
	        });
		});
		UA.on('registered', () => {
			console.info('Connected (Registered)');
			chrome.browserAction.setTitle({
                title : "Connected (Registered)"
            });
            chrome.browserAction.setBadgeBackgroundColor({color : '#006400'}, function(response){ console.info(response) });
            chrome.browserAction.setBadgeText({text:' '}, function(response) { console.info(response);});

            chrome.runtime.sendMessage({
	            action: 'ua_status',
	            status: "registered"
	        });
		});
		UA.on('unregistered', () => {
		    console.info('Connected (Unregistered)');
		    chrome.browserAction.setTitle({
                title : "Connected (Unregistered)"
            });
            chrome.browserAction.setBadgeBackgroundColor({color : '#800000'}, function(response){ console.info(response) });
		    chrome.browserAction.setBadgeText({text:' '}, function(response) { console.info(response);});

		    chrome.runtime.sendMessage({
	            action: 'ua_status',
	            status: "unregistered"
	        });
		});
		UA.on('registrationFailed', () => {
		    console.info('Connected (Unregistered)');
		    chrome.browserAction.setTitle({
                title : "Connected (Unregistered Failed)"
            });
            chrome.browserAction.setBadgeBackgroundColor({color : '#800000'}, function(response){ console.info(response) });
            chrome.browserAction.setBadgeText({text:' '}, function(response) { console.info(response);});

            chrome.runtime.sendMessage({
	            action: 'ua_status',
	            status: "unregistered"
	        });
		});
		UA.on('invite', (_session) => {
			session.newSession(_session);
        });
	},
	dial : (number , video = false) => {
		console.log('Audio/Video Call : '+typeof video + video);
		if(UA.isRegistered()) {
			if(!isEmpty(number)) {
				if(arraySize(_sessions) > 0) {
					notify("Maximum Call Limit Reached");
					return;
				}
				_session = UA.invite(number, { 
				sessionDescriptionHandlerOptions : {
	        		constraints: { audio: true, video : (String(video) == "true")},
	            		RTCConstraints: {"optional": [{'DtlsSrtpKeyAgreement': 'true'}]},
					}
				});
				session.newSession(_session);
			} else {
				notify("Number is required.");
			}
		} else {
			notify("SIP UA is not registered.");	
		}
	},
	hangup : (sessionId) => {
		if(_sessions[sessionId]) {
			session.hangup(_sessions[sessionId]);
		}
	},
	answer : (sessionId, _state) => {
		if(_sessions[sessionId]) {
			session.answer(_sessions[sessionId], _state);
		}
	},
	toggleHold : (sessionId, _state) => {
		if(_sessions[sessionId]) {
			session.toggleHold(_sessions[sessionId], _state);
		}
	},
	toggleMute : (sessionId, _state) => {
		if(_sessions[sessionId]) {
			session.toggleMute(_sessions[sessionId], _state);
		}
	},
	sendDTMF : (sessionId, _dtmf) => {
		if(_sessions[sessionId]) {
			session.sendDTMF(_sessions[sessionId], _dtmf);
		}
	},
	blindTx : (sessionId, _blindTxTo) => {
		if(_sessions[sessionId]) {
			session.blindTx(_sessions[sessionId], _blindTxTo);
		}
	},
}

window.session = {
	newSession : (_session) => {
		_sessions[_session.id] = _session;
		const callDirection = (_session.accept) ? 'incoming' : 'outgoing';
		const displayName = (_session && _session.remoteIdentity.displayName) || _session.remoteIdentity.uri.user;
		const _callerNumber = _session.remoteIdentity.uri.user;

		if(callDirection == 'incoming') {
			if(arraySize(_sessions) > 1) {
				_session.reject();
				console.error("Maximum Call Limit Reached");
				return;
			}
		}

		if(callDirection == 'incoming') {
			soundPlayer.setAttribute("src", "assets/sounds/play_file.ogg");
            soundPlayer.setAttribute("loop","true"); //For continuous ringing
            soundPlayer.play();
		}

		callPopupWindow = window.open('call_popup.html', "callPopup", "resizable = no,status = 1, height = 425, width = 475");
	    setTimeout(() => {
	        chrome.runtime.sendMessage({
	            action: "outgoingCallPopup",
	            from: _callerNumber,
	            displayName: displayName,
	            callDirection: callDirection,
	            _sessionId: _session.id
	        });
	    }, 1000);

		session.sessionHandler(_session);
	},
	sessionHandler : (_session) => {
		_session.on('progress', () => {
			soundPlayer.pause();
			console.log( 'Call is in progress' );
		});
		_session.on('accepted', () => {
			soundPlayer.pause();
			console.log('Call has been accepted');
			chrome.runtime.sendMessage({
		        action: "callAccepted"
		    });
			let pc = _session.sessionDescriptionHandler.peerConnection;
			let remoteView = document.getElementById('remoteVideo');
            let remoteStream = new MediaStream();
            pc.getReceivers().forEach(function(receiver) {
                remoteStream.addTrack(receiver.track);
            });

            if (typeof remoteView.srcObject !== 'undefined') {
                remoteView.srcObject = remoteStream;
            } else if (typeof remoteView.src !== 'undefined') {
                remoteView.src = window.URL.createObjectURL(remoteStream);
            } else {
                console.log('Error attaching stream to popup remoteVideo element.');
            }

            if (callPopupWindow) {
	            let remoteVideoPopup = callPopupWindow.document.getElementById("remoteVideo");
	            if (typeof remoteVideoPopup.srcObject !== 'undefined') {
	                remoteVideoPopup.srcObject = remoteStream;
	            } else if (typeof remoteVideoPopup.src !== 'undefined') {
	                remoteVideoPopup.src = window.URL.createObjectURL(remoteStream);
	            } else {
	                console.log('Error attaching stream to popup remoteVideo element.');
	            }
	        }

	        let localStream = new MediaStream();
	        pc.getSenders().forEach(function(sender) {
                localStream.addTrack(sender.track);
            });
	        if (localStream) {
	            console.log('Received local stream from server in session.on("accepted")', localStream);
	            if (callPopupWindow) {
	                var localVideoPopup = callPopupWindow.document.getElementById("localVideo");
	                if (typeof localVideoPopup.srcObject !== 'undefined') {
	                    localVideoPopup.srcObject = localStream;
	                } else if (typeof localVideoPopup.src !== 'undefined') {
	                    localVideoPopup.src = window.URL.createObjectURL(localStream);
	                } else {
	                    console.log('Error attaching stream to popup localVideo element.');
	                }
	            }
	        }

		});
		_session.on('trackAdded', () => {
			soundPlayer.pause();
			let pc = _session.sessionDescriptionHandler.peerConnection;
            let remoteStream = new MediaStream();
            pc.getReceivers().forEach((receiver)  => {
                remoteStream.addTrack(receiver.track);
            });
            let remoteView = document.getElementById('remoteVideo');
            if (typeof remoteView.srcObject !== 'undefined') {
                remoteView.srcObject = remoteStream;
            } else if (typeof remoteView.src !== 'undefined') {
                remoteView.src = window.URL.createObjectURL(remoteStream);
            } else {
                console.log('Error attaching stream to popup remoteVideo element.');
            }
            console.log('Received stream from server in session.mediaHandler.on("addStream")', remoteStream);
		});
		_session.on('bye', () => {
			soundPlayer.pause();
			chrome.runtime.sendMessage({
		        action: "terminated_call"
		    });
			console.log('Call has been ended.');
			delete _sessions[_session.id];
		});
		_session.on('failed', (request, cause) => {
			soundPlayer.pause();
			chrome.runtime.sendMessage({
		        action: "ended_call",
		        cause: cause
		    });
			console.log('Call has been failed due to cause', cause);
			delete _sessions[_session.id];
		});
		_session.on('terminated', (request, cause) => {
			soundPlayer.pause();
			chrome.runtime.sendMessage({
		        action: "ended_call",
		        cause: cause
		    });
			console.log('Call has been terminated due to cause', cause);
			delete _sessions[_session.id];
		});
	},
	hangup : (_session) => {
		if (!_session) {
            return;
        } else if (_session.startTime) { // Connected
            _session.bye();
        } else if (_session.reject) { // Incoming
            _session.reject();
        } else if (_session.cancel) { // Outbound
            _session.cancel();
        }
	},
	answer : (_session, _state) => {
		
        if (!_session) {
        	return;
        } else if (_session.accept && !_session.startTime) { 
			let options = {
	            sessionDescriptionHandlerOptions : {
	                constraints: { audio: true, video : _state }
	            }
	        };
	        try {
	        	_session.accept(options);
	            // Send this event to active call so that we can remove incoming call popup
	            myEvent.sendTo('active_call', {
					to : 'active_call',
					action : 'call_event',
					type : 'hangup',
					sessionId : _session.id
				});
				// Send this event to active call so that we can Add incoming call popup
				const displayName = (_session && _session.remoteIdentity.displayName) || _session.remoteIdentity.uri.user;
				const _callerNumber = _session.remoteIdentity.uri.user;
	            myEvent.sendTo('active_call', {
					to : 'active_call',
					action : 'call_event',
					from : _callerNumber,
					fromName : displayName,
					type : 'notify',
					callDirection : 'answered',
					sessionId : _session.id
				});
	        } catch (e) {
	        	console.log(e);
	        }
        }
	},
	toggleHold : (_session, _state ) => {
		if(!_session) {
			return;
		}
		if( _state == 'hold') {
			_session.hold();
		} else {
			_session.unhold();
		}
	},
	toggleMute : (_session, _state ) => {
		if(!_session) {
			return;
		} else {
			(_state == 'mute') ? _session.mute() : _session.unmute();
		}
	},
	sendDTMF : (_session, _dtmf ) => {
		if(!_session) {
			return;
		} else {
			_session.dtmf(_dtmf);
		}
	},
	blindTx : (_session, _blindTxTo ) => {
		if(!_session) {
			return;
		} else {
			_session.refer(_blindTxTo, {extraHeaders : ['Referred-By : sip:'+_accountCreds._sipExtension]});
		}
	}
}

let arraySize = (array) => {
    let c = 0;
    for(i in array) // in returns key, not object
        if(array[i] != undefined)
            c++;

    return c;
}

let isEmpty = (string) => {
	if (string == null || string == "" || string == undefined ){
		return true;
	} else {
		return false;
  	}
}