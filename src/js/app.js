/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */

class Chat {
  constructor() {
    this.user;
    this.apiUrl = 'https://ahj-websockets-server-uox1.onrender.com';
    this.createDOM();
    this.listener();
  }

  createDOM() {
    const registrationModal = document.createElement('div');
    registrationModal.className = 'modal registration';
    registrationModal.innerHTML = `
      <div class="title_modal">Choose a nickname</div>
      <div class="input_modal"><input class="input_reg"></div>
      <button class="proceed_modal">Continue</button>`;
    document.body.appendChild(registrationModal);

    const chatArea = document.createElement('div');
    chatArea.className = 'chat_area fog';
    chatArea.innerHTML = `
      <div class="user_window"></div>
      <div class="chat_list">
        <div class="chat"></div>
        <div class="input_area"><input class="input" type="text" placeholder="Type your text here"></div>
      </div>
    `;
    document.body.appendChild(chatArea);

    this.proceed = document.querySelector('.proceed_modal');
    this.chat = document.querySelector('.chat');
    this.usersWindow = document.querySelector('.user_window');
    this.input = document.querySelector('.input');
    this.registration = document.querySelector('.registration');
    this.chatArea = document.querySelector('.chat_area');
  }

  createMessage(data) {
    const message = document.createElement('div');
    const date = new Date().toLocaleTimeString();

    if (data.user === this.user) {
      message.className = 'my_message';
      message.innerHTML = `
        <div class="title">
          <div class="user active-user">You,</div>
          <div class="message_date active-user">${date}</div>
        </div>
        <div class="message_text">${data.message}</div>
      `;
    } else {
      message.className = 'message';
      message.innerHTML = `
        <div class="title my">
          <div class="user my">${data.user},</div>
          <div class="message_date my">${date}</div>
        </div>
        <div class="message_text">${data.message}</div>
      `;
    }

    this.chat.appendChild(message);
  }

  listener() {
    this.proceed.addEventListener('click', () => {
      const userName = this.proceed.previousElementSibling.querySelector('.input_reg').value;
      this.checkUserName(userName);
    });

    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.input.value) {
        const message = {
          type: 'send',
          user: this.user,
          message: this.input.value,
        };
        this.ws.send(JSON.stringify(message));
        this.input.value = '';
      }
    });
  }

  ws() {
    this.ws = new WebSocket('wss://ahj-websockets-server-uox1.onrender.com');
    this.ws.addEventListener('message', (e) => {
      const chatData = JSON.parse(e.data);
      console.log('Received data:', chatData);

      if (Array.isArray(chatData)) {
        this.displayUsers(chatData);
      } else if (chatData.type === 'send') {
        this.createMessage(chatData);
      }
    });

    this.ws.addEventListener('open', () => {
      console.log('WebSocket соединение установлено');
    });

    this.ws.addEventListener('close', () => {
      console.log('WebSocket соединение закрыто');
    });

    this.ws.addEventListener('error', (error) => {
      console.error('WebSocket ошибка:', error);
    });
  }

  async checkUserName(userName) {
    if (userName.length > 0) {
      const response = await fetch(`${this.apiUrl}/new-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userName }),
      });

      if (response.status === 200) {
        const result = await response.json();
        this.user = result.user.name;
        this.ws();
        this.showChat();
      } else if (response.status === 409) {
        alert('This nikckame is already in use. Please choose another one');
      } else {
        alert('An error occurred during registration. Please try again');
      }
    } else {
      alert('Choose a nickname');
    }
  }

  showChat() {
    this.registration.classList.add('fog');
    this.chatArea.classList.remove('fog');
  }

  displayUsers(usersList) {
    this.removeChilds(this.usersWindow);

    for (const user of usersList) {
      const displayUser = document.createElement('div');
      displayUser.className = 'online_user';
      displayUser.innerHTML = `
        <div class="circle"></div>
        <div class="username ${user.name === this.user ? 'active-user' : ''}">${user.name === this.user ? 'You' : user.name}</div>
      `;
      this.usersWindow.appendChild(displayUser);
    }
  }

  removeChilds(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const chat = new Chat();
});
