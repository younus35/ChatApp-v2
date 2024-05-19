document.addEventListener('DOMContentLoaded', () => {
    
    const emojiButton = document.getElementById('emojiButton');
    const emojiPicker = document.getElementById('emojiPicker');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesDiv = document.getElementById('messages');

    const token = localStorage.getItem('token');

    emojiButton.addEventListener('click', () => {
        if (emojiPicker.style.display === 'none') {
            emojiPicker.style.display = 'block';
        } else {
            emojiPicker.style.display = 'none';
        }
    });

    emojiPicker.addEventListener('emoji-click', (event) => {
        messageInput.value += event.detail.unicode;
        emojiPicker.style.display = 'none';
    });

    document.addEventListener('click', (event) => {
        if (!emojiPicker.contains(event.target) && !emojiButton.contains(event.target)) {
            emojiPicker.style.display = 'none';
        }
    });
    
    sendButton.addEventListener('click', async (event) =>{
        event.preventDefault();
        const message = messageInput.value;
        if(message){
            try{
                const response = await axios.post("http://localhost:3000/message/send-message",{ message: message },{headers:{"Authorization":token}})
                //{ message: message } because req.body.message i am using if we use message i should only use req.body only
                // Append the new message to the message display area
                const newMessage = document.createElement('div');
                newMessage.classList.add('message', 'mb-2', 'p-2', 'bg-light', 'rounded');
                newMessage.textContent = `${response.data.username}: ${response.data.message}`;
                messagesDiv.appendChild(newMessage);

                // Clear the input field
                messageInput.value = '';
            }
            catch(err){
                console.log(err);
            }
        }
    })

});