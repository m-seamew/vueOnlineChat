
//Firebase auth
const firebaseConfig = {
  apiKey: "AIzaSyAyBJA6eLY1amFa1FxRNQvk4t51eo4mu30",
  authDomain: "my-vue-project-52f12.firebaseapp.com",
  databaseURL: "https://my-vue-project-52f12.firebaseio.com",
  projectId: "my-vue-project-52f12",
  storageBucket: "my-vue-project-52f12.appspot.com",
  messagingSenderId: "324819722809",
  appId: "1:324819722809:web:18953d25602a67f514a3e8",
  measurementId: "G-HV67ZBN7QH"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let database = firebase.database();
let messagesRef = database.ref('messages');


let chatMain = {
  template: '#chat-main-template',
  props: {
    userData:{
      type: Object,
    },
  },
  data: function () {
    return {
      messages: [],
      messageText: '',
      editingMessage: null,
      commentingMessage: null,
      messageCommentText: '',
      //nickname: null,
    }
  },
  methods: {
    storeMessage() {
      messagesRef.push({ 
        text: this.messageText,
        nickname: this.userData.providerData[0].displayName, token: this.userData.providerData[0].uid,
        photo: this.userData.photoURL,
        comments: {},
        deleted: false,
        });
      this.messageText = '';
    },
    sendCommentMessage() {
      messagesRef.child(this.commentingMessage.id).child('comments').push({ 
        text: this.messageCommentText,
        nickname: this.userData.providerData[0].displayName, token: this.userData.providerData[0].uid,
        photo: this.userData.photoURL,
        });
      this.messageCommentText = '';
      this.commentingMessage = null;
    },
    deleteMessage(el) {
      let isEmpty = (Object.entries(el['comments']).length === 0 && el['comments'].constructor === Object);
 
      if(isEmpty){
        messagesRef.child(el.id).remove();
      }
      else{
        messagesRef.child(el.id).update({ text:"Text deleted by author", deleted: true });
      } 
    },
    deleteCommentMessage(el, com){
      console.log(com, el)
      messagesRef.child(el.id).child('comments').child(com.id).remove();
    }, 
    editMessage(el) {
      this.editingMessage = el;
      this.messageText = el.text;
    },
    editCommentMessage(el) {
      this.commentingMessage = el;
      this.messageCommentText = el.text;
    },
    commentMessage(el) {
      this.commentingMessage = el;
    },
    cancelMessage() {
      this.editingMessage = null;
      this.messageText = '';
    },
    cancelCommentMessage() {
      this.commentingMessage = null;
      this.messageCommentText = '';
    },
    updateMessage() {
      messagesRef.child(this.editingMessage.id).update({ text: this.messageText });
      this.cancelMessage();
    },
    updateCommentMessage(el) {
      messagesRef.child(el.id).child(`comments/${this.commentingMessage.id}`).update({ text: this.messageCommentText});
      this.cancelCommentMessage();
    }
  },
  created() {
    messagesRef.on('child_added', shapshot => {
      this.messages.push({ ...shapshot.val(), id: shapshot.key, comments: {}});
       
      messagesRef.child(`${shapshot.key}`).child('comments').on('child_added', shap => {
        let addComent = this.messages.find(el=> el.id === shapshot.key);
        let temp = this.messages[this.messages.indexOf(addComent)].comments;
        temp[shap.key] = {...shap.val(), id: shap.key};
      });
      
      if(this.userData !== null){
      
          if (this.userData.displayName !== shapshot.val().nickname) {
          nativeToast({
          message: `new message by ${shapshot.val().nickname}`,
          position: 'top',
          type: 'success'
          });
          }
      } 
    });
       
    messagesRef.on('child_removed', snapshot => {
      let removedItem = this.messages.find(el => el.id === snapshot.key);
      this.messages.splice(this.messages.indexOf(removedItem), 1);
    });

    messagesRef.on('child_changed', snapshot => {
      let updatedItem = this.messages.find(el => el.id === snapshot.key);
      updatedItem.text = snapshot.val().text;
      updatedItem.deleted = snapshot.val().deleted;

      messagesRef.child(`${snapshot.key}`).child('comments').on('child_added', shap => {
        updatedItem.comments[shap.key].text = shap.val().text;
      });

      messagesRef.child(`${snapshot.key}`).child('comments').on('child_removed', shap => {   
        let findMessage = this.messages.find(el=>el.id == snapshot.key);
       // delete findMessage.comments[key=`${shap.key}`];
        this.messages.splice(this.messages.indexOf(updatedItem), 1);
      });  
    });
  }, 
};

let loginForm = {
  template: '#login-form-template',
  data: function () {
    return {
     // email: '',
     // password: '',
      authUser: '',
     //userName: null,
     //userPhoto: null,
     // newPassword: null,
    }
  },
  methods: {
   
   /* register(){
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
      .catch(error => alert('Error:'+error.message));
    },
    login(){
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .catch(error => alert('Error:'+error.message));
    },*/

    signOut() {
      firebase.auth().signOut();
    },
    loginGoogle(){
      const provider = new firebase.auth.FacebookAuthProvider()

      firebase.auth().signInWithPopup(provider) 
      .catch(error => console.log('Error:'+error.message))
      .then(data => console.log(data.credential.accessToken));
    },
    /*
    changeUserData(){
      this.authUser.updateProfile({
        displayName: this.userName,
        photoURL: this.userPhoto,
      }) 
    },
    changeEmail(){
      this.authUser.updateEmail(this.email)
    },
    changePassword(){
      this.authUser.updatePassword(this.newPassword)
      .then(() => this.newPassword = '')
      .catch(error => console.log('Error:'+error.message))
    },
    linkGoogle(){
      const provider = new firebase.auth.GoogleAuthProvider()
      this.authUser.linkWithPopup(provider)
      .catch(error => console.log('Error:'+error.message))
    },
    unlinkGoogle(){
      this.authUser.unlink('google.com')
    }
    */
  },
  /*
  computed: {
    linkedGoogle(){
      return !!this.authUser.providerData.find(el => el.providerId === 'google.com');
    },
    linkedPasword(){
      return !!this.authUser.providerData.find(el => el.providerId === 'password');
    },
  },*/
  created(){
    firebase.auth().onAuthStateChanged(user => { 
      this.authUser = user;
      this.$emit('userdatarecive', this.authUser);

      if(user){
      this.dispalyName = user.userName;
      this.photoUrl = user.userPhoto;}
    });
  }
};

Vue.component('chat-module',{
  template: '#chat-module-template',
  data: function () {
    return {
      auth: {},
    }
  },
  components:{
    'login-form': loginForm,
    'chat-main': chatMain,
  },
  methods: {
    getDataUser(data){
      this.auth = data;
    }
  }
});

new Vue({
  el: "#app",
})