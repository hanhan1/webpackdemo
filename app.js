import bar from './bar';
import Vue from 'vue';
import AV from 'leancloud-storage';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

var APP_ID = 'V6pPTg64lUc5ylqgv329lR4E-gzGzoHsz';
var APP_KEY = '8OPVfG5xnXz5D9QXSjUSEfnQ';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY,
});

Vue.use(ElementUI);

var app = new Vue({
  el: '#app',
  data: {
    newTodo: '',
    todoList: [],
    actionType: 'signUp',
    formData: {
      username: '',
      password: ''
    },
    currentUser: null,
  },
  created: function () {
    window.onbeforeunload = () => {
      let dataString = JSON.stringify(this.todoList)
      //window.localStorage.setItem('myTodos', dataString)
      var AVTodo = AV.Object.extend('AllTodos');
      var todo = new AVTodo();
      var acl = new AV.ACL();
      acl.setReadAccess(AV.User.current(), true)
      acl.setWriteAccess(AV.User.current(), true)
      todo.set('content', dataString);
      todo.setACL(acl)
      todo.save().then(function (todo) {
        console.log('保存成功')
      }, function (error) {
        console.log('保存失败')
      });
      debugger
    }
    //let oldDataString = window.localStorage.getItem('myTodos')
    //let oldData = JSON.parse(oldDataString)
    //this.todoList = oldData || []
    this.currentUser = this.getCurrentUser();
    this.fetchTodos()
  },
  methods: {
    handleClick(tab,event){
       console.log(tab,event)
    },
    fetchTodos: function () {
      if (this.currentUser) {
        var query = new AV.Query('AllTodos');
        query.find()
          .then((todo) => {
            let avAllTodos = todo[0]
            let id = avAllTodos.id
            this.todoList = JSON.parse(avAllTodos.attributes.content)
            this.todoList.id = id

          }, function (error) {
            console.log(error)
          })
      }
    },
    updateTodos: function () {
      let dataString = JSON.stringify(this.todoList)
      let avTodos = AV.Object.createWithoutData('AllTodos', this.todoList.id)
      avTodos.set('content', dataString)
      avTodos.save().then(() => {
        console.log('更新成功')
      })
    },
    saveTodos: function () {
      let dataString = JSON.stringify(this.todoList)
      var AVTodos = AV.Object.extend('AllTodos');
      var avTodos = new AVTodos();
      avTodos.set('content', dataString);
      avTodos.save().then((todo) => {
        this.todoList.id = todo.id
        console.log('保存成功');
      }, function (error) {
        console.log('保存失败')
      });
    },
    saveOrUpdateTodos: function () {
      if (this.todoList.id) {
        this.updateTodos()
      } else {
        this.saveTodos()
      }
    },
    addTodo: function () {
      this.todoList.push({
        title: this.newTodo,
        createdAt: new Date(),
        done: false

      })
      console.log(this.todoList)
      this.newTodo = ''
      this.saveOrUpdateTodos()
    },
    removeTodo: function (todo) {
      let index = this.todoList.indexOf(todo)
      this.todoList.splice(index, 1)
      this.saveOrUpdateTodos()
    },
    signUp: function () {
      let user = new AV.User();
      user.setUsername(this.formData.username);
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser) => {
        this.currentUser = this.getCurrentUser()
      }, (error) => {
        alert('注册失败')
      });
    },
    login: function () {
      AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => {
        this.currentUser = this.getCurrentUser()
        this.fetchTodos()
      }, (error) => {
        alert('登录失败')
      });
    },
    getCurrentUser: function () {
      let current = AV.User.current()
      if (current) {
        let { id, createdAt, attributes: { username } } = AV.User.current()
        return { id, username, createdAt }
      } else {
        return null
      }
    },
    logout: function () {
      AV.User.logOut()
      this.currentUser = null
      window.location.reload()
    }
  }

})
