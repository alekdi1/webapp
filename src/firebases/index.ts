import firebase from "firebase";

const CONFIG = {
    apiKey: "AIzaSyC0nfQT9JdeAycJGQakWhjvG5tQnpM4-Mg",
    authDomain: "cpn-serve.firebaseapp.com",
    projectId: "cpn-serve",
    storageBucket: "cpn-serve.appspot.com",
    messagingSenderId: "682003587834",
    appId: "1:682003587834:web:9d5342e10bdd480fc05f43",
    measurementId: "G-ED8EM4NEL7"
}

const firebaseApp = firebase.initializeApp(CONFIG)
export const firestore = firebaseApp.firestore()

firestore.enablePersistence({ synchronizeTabs: true })

export const apiLogCollection = firestore.collection("ApiLogs")
