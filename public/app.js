const urlElement = document.getElementById('url');
const slugElement = document.getElementById('slug');
const buttonElement = document.getElementById('submit')
const responseElement = document.getElementById('response');
const submitForm = async () => {
    console.log(urlElement.value,slugElement.value);
    
   
       
   const responseBody = await fetch('/url', {
        method: 'POST',
        headers: {
            'content-type' : "application/json",

        },
        body: JSON.stringify({
            url:urlElement.value,
            slug:slugElement.value
        })

    })
    
    let response = await responseBody.json()
    console.log(response);
    if (!response.slug)
    {
        responseElement.innerHTML = response.message;
    }
    else {
    responseElement.innerHTML = `URL at ${window.location} ${JSON.stringify(response.slug)} successfully created. \n You will be redirected.`;
    setTimeout(function(){
        window.location.href = window.location + response.slug;
     }, 3000);
    
    }

}   


buttonElement.addEventListener('click',submitForm);
