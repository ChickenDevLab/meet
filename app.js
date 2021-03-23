var OV;
var session;

const SESSION_ID = 'dc-teams-insecure-alternative-tsjhjasd'

let muted = false

function joinSession() {

	const myUserName = 'egal'
	console.error(myUserName)

	OV = new OpenVidu();
	OV.enableProdMode()
	session = OV.initSession();

	session.on('streamCreated', event => {
		session.subscribe(event.stream, 'video')
	})

	getToken(SESSION_ID).then(token => {

		session.connect(token, { clientData: myUserName })
			.then(() => {
				var publisher = OV.initPublisher(null, {
					videoSource: false
				})
				$('#mute').click(() => {
					if(muted){
						publisher.publishAudio(true)
						$('#mute').text('Muten')
						muted = false
					} else {
						publisher.publishAudio(false)
						$('#mute').text('Entmuten')
						muted = true
					}
				})
				session.publish(publisher)
			})
			.catch(error => {
				console.log('There was an error connecting to the session:', error.code, error.message);
			});
	});
}

window.onbeforeunload = function () {
	if (session) session.disconnect();
}

document.addEventListener("DOMContentLoaded", (event) => {
    joinSession()
});

var OPENVIDU_SERVER_URL = "https://demos.openvidu.io:443";
var OPENVIDU_SERVER_SECRET = "MY_SECRET";

function getToken(mySessionId) {
	return createSession(mySessionId).then(sessionId => createToken(sessionId));
}

function createSession(sessionId) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: OPENVIDU_SERVER_URL + "/openvidu/api/sessions",
			data: JSON.stringify({ customSessionId: sessionId }),
			headers: {
				"Authorization": "Basic " + btoa("OPENVIDUAPP:" + OPENVIDU_SERVER_SECRET),
				"Content-Type": "application/json"
			},
			success: response => resolve(response.id),
			error: (error) => {
				console.log(error)
				if (error.status === 409) {
					resolve(sessionId);
				} else {
					console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + OPENVIDU_SERVER_URL);
					if (window.confirm('No connection to OpenVidu Server. This may be a certificate error at \"' + OPENVIDU_SERVER_URL + '\"\n\nClick OK to navigate and accept it. ' +
						'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' + OPENVIDU_SERVER_URL + '"')) {
						location.assign(OPENVIDU_SERVER_URL + '/accept-certificate');
					}
				}
			}
		});
	});
}

function createToken(sessionId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: OPENVIDU_SERVER_URL + '/openvidu/api/sessions/' + sessionId + '/connection',
            data: JSON.stringify({}),
            headers: {
                'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                'Content-Type': 'application/json',
            },
            success: (response) => resolve(response.token),
            error: (error) => reject(error)
        });
    });
}