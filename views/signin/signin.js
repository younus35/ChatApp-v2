const form = document.querySelector('form');

form.addEventListener('submit', async(event)=>{
    try{
        event.preventDefault();
        const login_details = {
          email:event.target.email.value,
          password:event.target.password.value
        }
        
    }
    catch(err){
        const message = document.querySelector('.hidden');
        message.innerHTML = `<p class="text-center text-danger mt-2 mb-0">${err.message}</p>`;
        console.log(err);
    }
})