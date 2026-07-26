function InsertPTAG(TheString){
    const PTAGElements = document.querySelectorAll('.PTAG');
    const RandomIndex = Math.floor(Math.random() * PTAGElements.length);

    if(PTAGElements[RandomIndex]){
        PTAGElements[RandomIndex].textContent = TheString;
    }
}

function InsertCPTAG(){
    const Elements = document.querySelectorAll('.CPTAG');

    // for(i = 0; i < Elements.length; i++){
    //     Elements[i].classList.add('TagHoverShow');
    //     Elements[i].setAttribute('onClick', 'CPTagClick();');
    // }

    const RandomIndex = Math.floor(Math.random() * Elements.length);

    if(Elements[RandomIndex]){
        Elements[RandomIndex].classList.add('TagHoverShow');
        Elements[RandomIndex].setAttribute('onClick', 'CPTagClick();');
    }
}

function InsertCFTAG(){
    const Elements = document.querySelectorAll('.CFTAG');

    // for(i = 0; i < Elements.length; i++){
    //     Elements[i].classList.add('TagHoverShow');
    //     Elements[i].setAttribute('onClick', 'CFTagClick();');
    // }

    const RandomIndex = Math.floor(Math.random() * Elements.length);

    if(Elements[RandomIndex]){
        Elements[RandomIndex].classList.add('TagHoverShow');
        Elements[RandomIndex].setAttribute('onClick', 'CFTagClick();');
    }
}

function LinkClick(SubPage){
    sendEventToUnreal("SubPageLinkClicked", { subPage: SubPage});
}

function CPTagClick(){
    sendEventToUnreal("CPTagClicked", {});
}

function CFTagClick(){
    sendEventToUnreal("CFTagClicked", {});
}