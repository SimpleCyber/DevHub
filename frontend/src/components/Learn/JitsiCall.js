import React, { useEffect, useRef } from "react";

const JitsiCall = ({ roomName, userName, onReady }) => {
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    // Load Jitsi script if not already loaded
    const scriptId = "jitsi-meet-script";
    let script = document.getElementById(scriptId);

    const initializeJitsi = () => {
      if (window.JitsiMeetExternalAPI) {
        const domain = "meet.jit.si";
        const options = {
          roomName:
            roomName ||
            "DevHub-WatchTogether-" + Math.random().toString(36).substring(7),
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName || "DevHub User",
          },
          configOverwrite: {
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "profile",
              "chat",
              "recording",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "invite",
              "feedback",
              "stats",
              "shortcuts",
              "tileview",
              "videobackgroundblur",
              "download",
              "help",
              "mute-everyone",
              "security",
            ],
            SETTINGS_SECTIONS: [
              "devices",
              "language",
              "moderator",
              "profile",
              "calendar",
            ],
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);

        if (onReady) {
          onReady(api);
        }

        return () => {
          api.dispose();
        };
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = initializeJitsi;
      document.body.appendChild(script);
    } else {
      initializeJitsi();
    }

    return () => {
      // Clean up if needed, but jitsi initialization might handle its own disposals
    };
  }, [roomName, userName, onReady]);

  return (
    <div
      ref={jitsiContainerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}
      className="bg-gray-800"
    />
  );
};

export default JitsiCall;
