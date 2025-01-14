import {createContext, useEffect, useState} from 'react';
import {patchUser} from '../../helpers/user/user';
import styles from '../../styles/teacher.module.scss';
import classNames from 'classnames';
// Create a context to manage the script loading state
const CloudinaryScriptContext = createContext();

function CloudinaryUploadWidget({setUser}) {
  const [loaded, setLoaded] = useState(false);
  const [publicId, setPublicId] = useState('');
  // Replace with your own cloud name
  const [cloudName] = useState('hzxyensd5');
  // Replace with your own upload preset
  const [uploadPreset] = useState('aoh4fpwm');
  const [uwConfig] = useState({
    cloudName,
    uploadPreset,
    cropping: true, //add a cropping step
    // showSkipCropButton: false,
    croppingAspectRatio: 1,
    // showAdvancedOptions: true,  //add advanced options (public_id and tag)
    sources: ['local', 'url'], // restrict the upload sources to URL and local files
    multiple: false, //restrict upload to a single file
    // folder: "user_images", //upload files to the specified folder
    // tags: ["users", "profile"], //add the given tags to the uploaded files
    // context: {alt: "user_uploaded"}, //add the given context data to the uploaded files
    clientAllowedFormats: ['images', 'jpg', 'jpeg', 'png', 'bmp', 'webp'], //restrict uploading to image files only
    maxImageFileSize: 2000000, //restrict file size to less than 1MB
    maxImageWidth: 2000, //Scales the image down to a width of 2000 pixels before uploading
    theme: 'white' //change to a purple theme
    // showPoweredBy: false,
    // showCompletedButton: true,
    // singleUploadAutoClose: false
  });

  useEffect(() => {
    // Check if the script is already loaded
    if (!loaded) {
      const uwScript = document.getElementById('uw');
      if (!uwScript) {
        // If not loaded, create and load the script
        const script = document.createElement('script');
        script.setAttribute('async', '');
        script.setAttribute('id', 'uw');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.addEventListener('load', () => setLoaded(true));
        document.body.appendChild(script);
      } else {
        // If already loaded, update the state
        setLoaded(true);
      }
    }
  }, [loaded]);

  const initializeCloudinaryWidget = async () => {
    if (loaded) {
      var myWidget = window.cloudinary.createUploadWidget(uwConfig, (error, result) => {
        if (!error && result && result.event === 'success') {
          console.log(result.info.secure_url);
          setUser(prev => {
            patchUser({id: prev.id, photoUrl: result.info.secure_url});
            return {...prev, photoUrl: result.info.secure_url};
          });
          setPublicId(result.info.public_id);
        }
      });

      document.getElementById('upload_widget').addEventListener(
        'click',
        function () {
          myWidget.open();
        },
        false
      );
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{loaded}} className={styles.info__avatar__button}>
      <button
        id="upload_widget"
        className={classNames('cloudinary-button', styles.info__avatar__button)}
        onClick={initializeCloudinaryWidget}>
        Upload
      </button>
    </CloudinaryScriptContext.Provider>
  );
}

export default CloudinaryUploadWidget;
export {CloudinaryScriptContext};
