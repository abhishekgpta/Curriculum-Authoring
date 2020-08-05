export default (e, setData)=>{
    let file = e.target.files[0];
    let reader = new FileReader(); 
    reader.readAsText(file);
    reader.onload = function() {
        try{
            const dataset = JSON.parse(reader.result);
            setData(dataset)
        }
        catch(err){
            console.error("Problem with JSON file",err)
        }
    };
    reader.onerror = function() {
        console.error("Reader:::",reader.error);
    };
}