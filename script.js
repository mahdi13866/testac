
let video = document.getElementById('video');
let savedDescriptor = null;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("خطا در دریافت دوربین:", err));
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    if (savedDescriptor && detections.length > 0) {
      const faceMatcher = new faceapi.FaceMatcher([savedDescriptor]);
      const match = faceMatcher.findBestMatch(detections[0].descriptor);
      document.getElementById('status').innerText = match.toString();
      if (match.label !== 'unknown') {
        computeNiyatNumber();
      }
    }
  }, 1000);
});

function saveFace() {
  faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceDescriptor()
    .then(detection => {
      if (detection) {
        savedDescriptor = new faceapi.LabeledFaceDescriptors("user", [detection.descriptor]);
        document.getElementById('status').innerText = "چهره ذخیره شد";
      }
    });
}

function computeNiyatNumber() {
  const date = new Date();
  const niyat = (date.getFullYear() + date.getMonth() + 1 + date.getDate() + date.getHours() + date.getMinutes()) % 100;
  document.getElementById('result').innerText = "عدد نیت شما: " + niyat;
}
