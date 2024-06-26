let flag =true; //flag is used to display one popup card at a time.

const addListItem = (listCard, listitem, itemStatus) => {  //display the list items inside the list card.
    if(itemStatus === 'complete'){
        const completeList = listCard.querySelector('.complete-list');
        const listItemCard = document.createElement('div');
        listItemCard.classList.add('c-list-item-card');
        listItemCard.innerHTML = `${listitem}`;

        completeList.appendChild(listItemCard); 
    }else{
        const completeList = listCard.querySelector('.incomplete-list');
        const listItemCard = document.createElement('div');
        listItemCard.classList.add('in-list-item-card');
        listItemCard.innerHTML = `${listitem}`;

        completeList.appendChild(listItemCard); 
    }
}


const addListCard = (listName) => {  //geting list name.
    //display list card.
    const listContainer = document.querySelector('.list-container');
    const listCard = document.createElement('div');
    listCard.classList.add('list-card');
    const htmlData = `<div class="list-header">
                        <h1 class="listname_header">${listName}</h1> 
                        <div class="button-container">
                            <button id="add-button"><i class="fa-solid fa-plus"></i>ADD ITEM</button>
                            <button id="delete-button"><i class="fa-solid fa-trash"></i>DELETE LIST</button>
                        </div>
                      </div>
                      <div class="complete-list"></div>
                      <div class="incomplete-list"></div>`
    listCard.insertAdjacentHTML('afterbegin',htmlData);
    listContainer.appendChild(listCard);
    //using the list name fetching all list item.
    const encodedlistName = encodeURIComponent(listName);
    const alllistItemRequest = new XMLHttpRequest();
    alllistItemRequest.onreadystatechange = getListItemAjaxFunction;
    alllistItemRequest.open('GET', 'api/listitem_fetch.php?listname=' + encodedlistName);
    alllistItemRequest.send();

    function getListItemAjaxFunction () {
        if(alllistItemRequest.readyState===XMLHttpRequest.DONE){
            if(alllistItemRequest.status === 200){
                const listitemdata = JSON.parse(alllistItemRequest.responseText);
                listitemdata.forEach((itemdata) => {
                    addListItem(listCard, itemdata.listitem, itemdata.itemstatus); //display the list items inside the list card.
                });
            }
        }
    }
}

//Create a new list using create button.
const createButton = document.querySelector('#create-button');
createButton.addEventListener('click', () => {
    if(flag){
        flag=false;
        //display the CREATE-POPUP-CARD to fill a form.
        const fullScreen = document.querySelector('.fullscreen');
        const createPopupCard = document.createElement('div');
        createPopupCard.classList.add('create-popup-card');
        const htmlData = `<button id="create-close-button"><i class="fas fa-times"></i></button>
                        <h1>Select List Name</h1>
                        <br/>
                        <form>
                            <textarea id="listname_textarea" maxlength="30"></textarea>
                        </form>
                        <button id="create-submit-button">SUBMIT</button>`
        createPopupCard.insertAdjacentHTML('afterbegin', htmlData);
        fullScreen.appendChild(createPopupCard);
        createPopupCard.style.display = "flex";
        //Add function to the close button of CREATE-POPUP-CARD.
        const closeButton = createPopupCard.querySelector('#create-close-button');
        closeButton.addEventListener('click', () => {
            createPopupCard.style.display = "none";
            flag=true;
        });
         //Add function to the submit button of CREATE-POPUP-CARD.
        const submitButton = createPopupCard.querySelector('#create-submit-button');
        submitButton.addEventListener('click', () => {
            //getting the list name that is selected from CREATE-POPUP-CARD form.
            const newListname = createPopupCard.querySelector('#listname_textarea');
            const listName = newListname.value;
            createPopupCard.style.display = "none";
            flag=true;
            //encode list name.
            if(listName === ''){
                alert('List Name Cannot be Empty');
            }else{
                //The encodeURIComponent() function in JavaScript is used to encode special characters in a URL
                const encodedlistName = encodeURIComponent(listName); 
                //For Example Before encoding: listName="PROGRAMMING LANGUAGE & DSA & DAA" 
                //After encoding: URL="PROGRAMMING%20LANGUAGE%20%26%20DSA%20%26%20DAA"
                //PHP automatically decodes the URL-encoded data, so you will get the original value ("PROGRAMMING LANGUAGE & DSA & DAA") instead of the encoded one.
                const addNewListCardRequest = new XMLHttpRequest(); //creating a new http request
                addNewListCardRequest.onreadystatechange = postAjaxFunction;
                addNewListCardRequest.open('POST', 'api/listname_store.php');
                addNewListCardRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                addNewListCardRequest.send('listname=' + encodedlistName); //initaiting the http request and send encoded list name.
                
                function postAjaxFunction () {
                    if(addNewListCardRequest.readyState===XMLHttpRequest.DONE){
                        if(addNewListCardRequest.status === 200){
                            const response = addNewListCardRequest.responseText;
                            if(response === 'list already selected'){
                                alert('list already created');
                            }else{
                                addListCard(listName);  //display the list card.
                            }
                        }
                    }
                }
            }
        })
    }
})

//When reload the browser then fetching list name one by one and displaying list cards.
window.addEventListener('DOMContentLoaded', () => {
    const allListCardRequest = new XMLHttpRequest();
    allListCardRequest.onreadystatechange = getAjaxFunction;
    allListCardRequest.open('GET', 'api/listname_fetch.php');
    allListCardRequest.send();

    function getAjaxFunction () {
        if(allListCardRequest.readyState===XMLHttpRequest.DONE){
            if(allListCardRequest.status === 200){
                const listNames = JSON.parse(allListCardRequest.responseText);
                listNames.forEach((listName) => {
                    addListCard(listName);
                });
            }
        }
    }
})

document.addEventListener('click', (event) => {
    if (event.target.id === 'delete-button') {//if delete button clicked the deleting the entire list.
        if(flag){
            flag=false;
            const listCard = event.target.closest('.list-card');
            const h1Element = listCard.querySelector('h1');
            //Creating a tempotaty div and include h1element inner HTML as inner HTML.
            const temporaryDiv = document.createElement('div');
            temporaryDiv.innerHTML = h1Element.innerHTML;
            //Then aecessing the innerHTML of the temporary div as a text.
            // this process required when text include some special caracter.
            const listname = temporaryDiv.innerText;
        
            if (confirm(`Are you sure you want to delete the list "${listname}"?`)) {
                listCard.remove();
                // Properly encode the parameters
                const encodedlistName = encodeURIComponent(listname);
                const deleteListCardRequest = new XMLHttpRequest();     
                deleteListCardRequest.onreadystatechange = postListDeleteAjaxFunction;
                deleteListCardRequest.open('POST', 'api/listdelete.php');
                deleteListCardRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                deleteListCardRequest.send('listname=' + encodedlistName);

                function postListDeleteAjaxFunction () {
                    if(deleteListCardRequest.readyState===XMLHttpRequest.DONE){
                        if(deleteListCardRequest.status === 200){
                            const response = deleteListCardRequest.responseText;
                            alert(response);
                        }
                    }
                }
            }
            flag=true;
        }
    }else if(event.target.id === 'add-button'){ //when add button clicked, adding a new list item to the list.
        if(flag){
            flag=false;
            //display the list-popup-card.
            const fullScreen = document.querySelector('.fullscreen');
            const listPopupCard = document.createElement('div');
            listPopupCard.classList.add('list-popup-card');
            const htmlData = `<button id="list-close-button"><i class="fas fa-times"></i></button>
                            <h1 class="Additem-cardheader">Select Name</h1>  
                            <br/>           
                            <form id="list-form">
                                <textarea name="list-item" id="list-item-textarea" maxlength="40"></textarea>
                                <br/>
                                <h1 class="Additem-cardStatusHeader">Select Status</h1>  
                                <div class="input-div">
                                    <input type="radio" name="status" value="complete">
                                    <h1 class="input-name">COMPLETE</h1>
                                    <input type="radio" name="status" value="incomplete">
                                    <h1 class="input-name">INCOMPLETE</h1>
                                </div>    
                                <br/>
                            </form>
                            <button id="list-submit-button">SUBMIT</button>`
            listPopupCard.insertAdjacentHTML('afterbegin', htmlData);
            fullScreen.appendChild(listPopupCard);
            listPopupCard.style.display = "flex";

            const closeButton = listPopupCard.querySelector('#list-close-button');
            closeButton.addEventListener('click', () => {
                listPopupCard.style.display = "none";
                flag=true;
            });

            const submitButton = listPopupCard.querySelector('#list-submit-button');
            submitButton.addEventListener('click', () => {
            const textArea = listPopupCard.querySelector('textarea');
            const listItem = textArea.value;
            const inputValue = listPopupCard.querySelector('input:checked');
            if(listItem === "" || inputValue === null){
                alert('please fill all field');
            }else{
                const itemStatus = inputValue.value;
                const trimListItem = listItem.trim(); //triming the list item name given by user.
                const listCard = event.target.closest('.list-card');
                const h1Element = listCard.querySelector('h1');
                //creating a temporaryDiv.
                const temporaryDiv = document.createElement('div');
                temporaryDiv.innerHTML = h1Element.innerHTML;
                const listName = temporaryDiv.innerText;
                listPopupCard.style.display = "none";
                flag=true;

                const addNewListItemRequest = new XMLHttpRequest();
                addNewListItemRequest.onreadystatechange = postListItemAjaxFunction;
                addNewListItemRequest.open('POST', 'api/listitem_store.php');
                addNewListItemRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                // Properly encode the parameters
                const encodedListItem = encodeURIComponent(trimListItem);
                const encodedListName = encodeURIComponent(listName);
                addNewListItemRequest.send('listitem=' + encodedListItem + '&listname=' + encodedListName + '&itemstatus=' + itemStatus);            
                function postListItemAjaxFunction () {
                    if(addNewListItemRequest.readyState===XMLHttpRequest.DONE){
                        if(addNewListItemRequest.status === 200){
                            const response = addNewListItemRequest.responseText;
                            console.log(response);
                            if(response === 'Item already exist'){
                                alert('Item already exist');
                            }else{
                                // alert('Item added sucessfully');
                                addListItem(listCard,trimListItem,itemStatus);
                            }
                        }
                    }
                }
            }
        })
        }
    } else if(event.target.classList.contains('c-list-item-card') || event.target.classList.contains('in-list-item-card')){  //toggle between complete list and incomplete list.
        if(flag){
            flag=false;
            //display the listitem-popup card form.
            const fullScreen = document.querySelector('.fullscreen');
            const listItemPopupCard = document.createElement('div');
            listItemPopupCard.classList.add('listitem-popup-card');
            const htmlData = `<button id="listitem-close-button"><i class="fas fa-times"></i></button>
                            <h1 class="changeStatus-header">Change Status</h1>           
                            <button id="listitem-changestatus-button">CHANGE</button>
                            <br/>
                            <h1 class="deleteItem-header">Delete item</h1>
                            <button id="listitem-delete-button">DELETE</button>`
            listItemPopupCard.insertAdjacentHTML('afterbegin', htmlData);
            fullScreen.appendChild(listItemPopupCard);

            listItemPopupCard.style.display = "flex";

            const closeButton = listItemPopupCard.querySelector('#listitem-close-button');
            closeButton.addEventListener('click', () => {
                listItemPopupCard.style.display = "none";
                flag=true;
            });
            //adding function to the change button.
            const changestatusButton = listItemPopupCard.querySelector('#listitem-changestatus-button');
            changestatusButton.addEventListener('click', () => {
                const listCard = event.target.closest('.list-card');
                let listitem, itemName, newItemStatus;
                if(event.target.classList.contains('c-list-item-card')){
                    listitem = event.target.closest('.c-list-item-card');
                    const temporaryDiv = document.createElement('div');
                    temporaryDiv.innerHTML = event.target.innerHTML;
                    itemName = temporaryDiv.innerText;
                    newItemStatus = 'incomplete';
                }else{
                    listitem = event.target.closest('.in-list-item-card');
                    const temporaryDiv = document.createElement('div');
                    temporaryDiv.innerHTML = event.target.innerHTML;
                    itemName = temporaryDiv.innerText;
                    newItemStatus = 'complete';
                }

                listItemPopupCard.style.display = "none";
                flag=true;
                const encodeditemName = encodeURIComponent(itemName);
                const updateListItemRequest = new XMLHttpRequest();
                updateListItemRequest.onreadystatechange = postUpdateListItemAjaxFunction;
                updateListItemRequest.open('POST', 'api/listitem_update.php');
                updateListItemRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                updateListItemRequest.send('itemname=' + encodeditemName + '&newitemstatus=' + newItemStatus);
            
                function postUpdateListItemAjaxFunction () {
                    if(updateListItemRequest.readyState===XMLHttpRequest.DONE){
                        if(updateListItemRequest.status === 200){
                            const response = updateListItemRequest.responseText;
                            listitem.remove();
                            // alert(response);
                            addListItem(listCard,itemName,newItemStatus);
                        }
                    }
                }
            })

            const listitemDeleteButton = listItemPopupCard.querySelector('#listitem-delete-button');
            listitemDeleteButton.addEventListener('click', () => {
                let listitem, itemName;
                if(event.target.classList.contains('c-list-item-card')){
                    listitem = event.target.closest('.c-list-item-card');
                    const temporaryDiv = document.createElement('div');
                    temporaryDiv.innerHTML = event.target.innerHTML;
                    itemName = temporaryDiv.innerText;
                }else{
                    listitem = event.target.closest('.in-list-item-card');
                    const temporaryDiv = document.createElement('div');
                    temporaryDiv.innerHTML = event.target.innerHTML;
                    itemName = temporaryDiv.innerText;
                }

                listItemPopupCard.style.display = "none";
                flag=true;
                const encodeditemName = encodeURIComponent(itemName);
                const deleteListItemRequest = new XMLHttpRequest();
                deleteListItemRequest.onreadystatechange = postDeleteListItemAjaxFunction;
                deleteListItemRequest.open('POST', 'api/listitem_delete.php');
                deleteListItemRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                deleteListItemRequest.send('itemname=' + encodeditemName);
            
                function postDeleteListItemAjaxFunction () {
                    if(deleteListItemRequest.readyState===XMLHttpRequest.DONE){
                        if(deleteListItemRequest.status === 200){
                            const response = deleteListItemRequest.responseText;
                            listitem.remove();
                            // alert(response);
                        }
                    }
                }
            })
        }
    }
});

