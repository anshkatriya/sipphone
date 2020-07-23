# SIP Phone
SIP Phone is an WebRTC based Chrome Extension Dialer. It works using WebRTC & SIP protocol. You can use in place of Softphone.

# Key Features:
1) Call Type
- Audio Call
- Video Call
2) Call Assitant
- Do Not Disturb
- Auto Answer Incoming Calls

# Call Features:
- Hold/Unhold
- Mute/Unmute
- Send DTMF
- 100rel (Early Media Support)
- Call Transfer (Blind)

# How to use
- Install Chrome Extension from this link : https://chrome.google.com/webstore/detail/sip-phone/eeffaijobgkgngjemggokhbjfmhklcmi
- Click on Chrome Extension Icon in toolbar
- If you're not logged in, it will open new window to enter credentials
- Enter requested permission for Microphone and Camera
- Click on 'Add Account' button
- Click on Chrome Extension Icon in toolbar, it will open dialpad in popup window
- Enter the number and click on Audio/Video button to dial entered number
- Enjoy it!

# Frequently Asked Questions
1) What is WSS Server?
- WSS Server is required to establish communcation between SIP server and SIP client (Chrome Extension)
2) Which SIP stack has been used?
- We have used SIP.js library. We're thankfull to SIP.js team for this awesome library.
3) What is my server does not support WSS?
- If your server does not support, you can setup webrtc proxy server using OpenSIPs/Kamalio etc OR you can use any open source wss proxy server like WebRTC2SIP (https://webrtc2sip.xyz)
4) What will be WSS server in case of WebRTC2SIP?
- You need to enter wss://webrtc2sip.xyz:10062 in WSS Server field
5) What WebRTC2SIP does?
- WebRTC2SIP is an WebRTC Gateway which will add support of WebRTC into your VoIP Server. It will work as an WebRTC proxy for your server. They are just transmitting all requests received on their server to your destined(sip) server. Requests they received on WS, WSS or UDP, they're just routing those request to your server via working as Proxy for you.

# Upcoming Features
- Attended Transfer
- Local Call History Suppport
- Local Phonebook Support
- Remote Phonebook Support
- Enable Click2Call support from any webpage

We would love to keep udpated this extension. Also, we wants to add some features which will helps you a lot. If you have any query/feedback/suggestions, you can directly reach to me on:
- E-mail: anshkatriya@gmail.com
- Skype: ghanshyam.katriya

Kindly keep donating from your heart to keep motivating us.

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/paypalme/anshkatriya)


Report any issues or provide suggestions : https://github.com/anshkatriya/sipphone/issues
