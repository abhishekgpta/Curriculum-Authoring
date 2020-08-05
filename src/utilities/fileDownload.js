export default (data)=>{
    // const fileName = data.course;
    //TODO change filename from hardcoded to course name
    //TODO error message for empty dataset
    //TODO Look for async file download
    const fileName = "mathematics";
    const stringData = JSON.stringify(data);
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(stringData);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", fileName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove()
} 