import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import VueTextareaAutosize from 'vue-textarea-autosize';

// Your web app's Firebase configuration
import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBe3Mun-mN1_buatgQkd6BC-endmUkK1cE",
    authDomain: "vue-calendar-fcabc.firebaseapp.com",
    databaseURL: "https://vue-calendar-fcabc.firebaseio.com",
    projectId: "vue-calendar-fcabc",
    storageBucket: "vue-calendar-fcabc.appspot.com",
    messagingSenderId: "142285300211",
    appId: "1:142285300211:web:3abb8b57d6c39cbbb63286"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// db bring every collection from firebase (we can make CRUD with db)
export const db = firebase.firestore();

Vue.config.productionTip = false

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')