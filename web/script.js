// Generate random room name if needed
if (!location.hash) {
    location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
}
const roomHash = location.hash.substring(1);

let drone;

// Room name needs to be prefixed with 'observable-'
const roomName = 'observable-' + roomHash;
const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: ["turn:207.148.23.14:3478"],
            "username":"someuser",
            "credential":"somepassword"
        }
    ]
};

let room;
let pc;

let localStream = null;

const candidatesQueue = [];

let alreadyDeferredOfferer = false;
let isOfferer = false;

function processCandidatesQueueIfReady() {
    if (pc.localDescription && pc.remoteDescription) {
        console.log("Processed candidates.");
        while (candidatesQueue.length > 0) {
            const candidate = candidatesQueue.shift();
            pc.addIceCandidate(
                new RTCIceCandidate(candidate),
                onSuccess,
                onError
            )
        }
    } else {
        console.log("Received candidate, but a description has not been set yet.");
    }
}

function onSuccess() {}
function onError(error) {
    console.error(error);
}
setupLocalVideo().then(() => {
    drone = new ScaleDrone('S2ktEkKPVRBiKCka');
    drone.on('open', error => {
        if (error) {
            return console.error(error);
        }
        room = drone.subscribe(roomName);
        room.on('open', error => {
            if (error) {
                onError(error);
            }
        });
        // We're connected to the room and received an array of 'members'
        // connected to the room (including us). Signaling server is ready.
        room.on('members', members => {
            console.log('MEMBERS', members);
            // If we are the second user to connect to the room we will be creating the offer
            const membersWithoutDebugger = members.filter(el => el.authData === undefined || !el.authData.user_is_from_scaledrone_debugger);

            if (membersWithoutDebugger.length > 1) {
                sendMessage("don't want offerer");
                alreadyDeferredOfferer = true;
            }

            startWebRTC();
            startListeningToSignals();
        });
    });
});

// Send signaling data via Scaledrone
function sendMessage(message) {
    drone.publish({
        room: roomName,
        message
    });
}

function negotiate() {
    console.log("Negotiation was needed.");
    pc.createOffer().then(localDescCreated).catch(onError);
}

function startWebRTC() {
    pc = new RTCPeerConnection(configuration);

    // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
    // message to the other peer through the signaling server
    pc.onicecandidate = event => {
        if (event.candidate) {
            sendMessage({'candidate': event.candidate});
        }
    };

    // When a remote stream arrives display it in the #remoteVideo element
    pc.ontrack = event => {
        console.log("Remote stream added.");
        const stream = event.streams[0];
        if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
            remoteVideo.srcObject = stream;
        }
    };

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
}

function setupLocalVideo() {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    }).then(stream => {
        // Display your local video in #localVideo element
        localStream = stream;
        localVideo.srcObject = stream;
    }, onError);
}

function startListeningToSignals() {
    // Listen to signaling data from Scaledrone
    room.on('data', (message, client) => {
        // Message was sent by us
        if (client.id === drone.clientId) {
            return;
        }

        if (message.sdp) {
            // This is called after receiving an offer or answer from another peer
            pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
                console.log("Received remote description.");

                // When receiving an offer lets answer it
                if (pc.remoteDescription.type === 'offer') {
                    pc.createAnswer().then(localDescCreated).catch(onError);
                }

                processCandidatesQueueIfReady();
            }, onError);
        } else if (message.candidate) {
            // Add the new ICE candidate to our connections remote description
            candidatesQueue.push(message.candidate);

            processCandidatesQueueIfReady();
        } else if (message === "don't want offerer") {
            // Basically if we said we don't want to be the offerer, and then our peer comes back to us
            // and says that they also don't want to be the offerer, we will become the offerer.
            if (pc.localDescription || pc.remoteDescription || isOfferer) {
                // We had already connected before so we need to restart
                console.log("Restarting ice.");
                pc.close();
                startWebRTC();
                isOfferer = false;
                alreadyDeferredOfferer = true;
                sendMessage("don't want offerer");
                // sendMessage("is offerer");
                // isOfferer = true;
                // pc.restartIce();
                // negotiate();
            } else if (alreadyDeferredOfferer) {
                sendMessage("is offerer");
                isOfferer = true;
                pc.onnegotiationneeded = negotiate;
                negotiate();
            } else {
                sendMessage("don't want offerer");
                alreadyDeferredOfferer = true;
            }
        } else if (message === "is offerer") {
            console.log("Peer is claiming offerer role.");
        } else {
            console.log("Received unknown message:", message);
        }
    });
}

function localDescCreated(desc) {
    pc.setLocalDescription(
        desc,
        () => {
            console.log("Received local description.");
            sendMessage({'sdp': pc.localDescription});
        },
        onError
    );
}
