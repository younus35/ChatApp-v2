const back = document.getElementById('back');
document.addEventListener('DOMContentLoaded', async () =>{
    const usersDiv = document.getElementById('groupmembers');
    const currentGroupId = localStorage.getItem('groupId')
    const token = localStorage.getItem('token');

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/group/${currentGroupId}/members`,{
                headers: { "Authorization": token }
            });
            const users = response.data;
            usersDiv.innerHTML = '';
            users.forEach(user => {
                const userItem = document.createElement('li');
                userItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                const userDetails = document.createElement('span');
                userDetails.textContent = `name: ${user.name} email: ${user.email} number: ${user.phonenumber}`;
                userItem.appendChild(userDetails);

                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.classList.add('btn', 'btn-danger');
                removeButton.addEventListener('click', async ()=>{
                    try {
                        await axios.delete(`http://localhost:3000/group/remove-user/${user.id}`, {
                            headers: { "Authorization": token },
                            data: { groupId: currentGroupId } // Send the groupId in the body
                        });
                        // Remove the userItem from the DOM
                        userItem.remove();
                    } catch (err) {
                        console.log(err);
                    }
                });
                userItem.appendChild(removeButton);

                usersDiv.appendChild(userItem);
            });
        } catch (err) {
            console.log(err);
        }
    };
    await fetchUsers();
})
back.addEventListener('click', () =>{
    localStorage.removeItem('groupId');
    window.location.href = '../chatapp/chatapp.html';
})