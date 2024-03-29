import Authorization from './auth.js';
import ColorPicker from './msg_color.js';

/**
 * @class
 * @description Class, that working with web sockets. And based on this, interact with page
 */
class Connection {
	/**
	 * @constructor
	 * @description Init base elements necessary for work
	 */
	constructor () {
		this.textarea = document.querySelector('#message');
		this.btn = document.querySelector('button');
		this.chatForm = document.querySelector('.all__messages');
		this.theme = new ColorPicker().getColorTheme();
	}

	/**
	 * @async
	 * @method
	 * @description Get user's input data from authorization form and run `webSoketsWork` method
	 */
	async getAuthData () {
		this.authUser = await new Authorization().auth();
		this.webSocketsWork();
	}

	/**
	 * @method
	 * @description Render new message on form
	 * @param {String} text - html structure, that contains message
	 */
	changeChatForm (text) {
		this.chatForm.innerHTML+=text;
	}

	/**
	 * @method
	 * @description Establishing a connection and launching event handlers necessary for operation
	 */
	webSocketsWork () {
		this.socket=io.connect({query: {'name': this.authUser}});
		this.runEventHandlers();
	}

	/**
	 * @method
	 * @description Launching event handlers necessary for operation
	 */
	runEventHandlers () {
		this.btn.addEventListener('click', this.sendUserMessage.bind(this));
		this.socket.on('connect_user', this.connectNewUser.bind(this));
		this.socket.on('disconnect_user', this.disconnectUser.bind(this));
		this.socket.on('get_msg', this.getMessage.bind(this));
	}

	/**
	 * @method
	 * @description Method, that get sent message. And draw it on form
	 * @param {Object} msg - received message
	 */
	getMessage ({msg}) {
		const messageTemplate = `
            <div class="${msg.theme}">
                <h6>${msg.name}:</h6>
                <p>${msg.message}</p>
            </div>`;
		this.changeChatForm(messageTemplate);
	}

	/**
	 * @method
	 * @description Method, that send message
	 */
	sendUserMessage () {
		if (this.textarea.value.trim()) {
			this.socket.emit('send', {name: this.authUser, message: this.textarea.value, theme: this.theme});
			this.textarea.value='';
		}
	}

	/**
	 * @method
	 * @param {String} username - The name of the user who connected to the chat
	 */
	connectNewUser (username) {
		debugger;
		this.changeChatForm(`<p class="connect">User ${username} has been connected</p>`);
	}

	/**
	 * @method
	 * @param {String} username - The name of the user who disconnected from the chat
	 */
	disconnectUser (username) {
		this.changeChatForm(`<p class="disconnect">User ${username} has been disconnected</p>`);
	}
}

const connection = new Connection();
connection.getAuthData();