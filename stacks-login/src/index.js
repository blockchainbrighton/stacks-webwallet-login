import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded and parsed");
    document.getElementById('loginBtn').addEventListener('click', () => {
        const myAppName = 'My Stacks Web-App';
        const myAppIcon = window.location.origin + '/my_logo.png';

        showConnect({
            userSession,
            appDetails: {
                name: myAppName,
                icon: myAppIcon,
            },
            onFinish: () => {
                window.location.reload();
            },
            onCancel: () => {
                console.log('User cancelled login');
            },
        });
    });
});

