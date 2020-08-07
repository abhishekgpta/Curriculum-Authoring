import React,{useState, useEffect} from 'react';

import AddStandard from './standard-row';

import Add from '../assets/add.svg';

export default props =>{
    const {dataset={}, setData} = props
    let [selectedStandard,setSelectedStandard] = useState('');
    let [selectedInputData,setSelectedInputData] = useState('');

    const handleAddRow = ()=>{
        const id = new Date().getTime().toString();
        let newDataSet = {
            ...dataset,
            [id]:{
                "id": id,
                "title" : "",
                "indentation": 0,
                "children": [],
                "parentID": null,
            }
        }
        setSelectedStandard(id);
        setSelectedInputData("");
        setData(newDataSet);
    }
    const handleDeleteRow =(id)=>{
        const newDataset = {...dataset};
        /*
        * To delete a Standard
        * 1. remove the object from dataset
        * 2. check all the nodes and remove parent refrences
        * 3. check all nodes and remove children refrences
        * 4. handle parent for rest of children tree
        * 5. handle indentation for rest of children tree
        */
       let standard2Delete = newDataset[id];
       if(standard2Delete){
            if(standard2Delete.parentID){
                newDataset[standard2Delete.parentID].children = newDataset[standard2Delete.parentID].children.filter((childIds)=>childIds.toString() !== id.toString()); 
                for(let stdIds of standard2Delete.children){
                    newDataset[stdIds].parentID = standard2Delete.parentID;
                    newDataset[stdIds].indentation--;
                }
                newDataset[standard2Delete.parentID].children = [...newDataset[standard2Delete.parentID].children,...standard2Delete.children]; 
            }
            else{
                for(let stdIds of standard2Delete.children){
                    newDataset[stdIds].parentID = null;
                    newDataset[stdIds].indentation--;
                }
            }
            delete newDataset[id];
            setData(newDataset)
       }
    }
    const handleSetTitle=(id,value)=>{
        const newDataSet = {...dataset};
        newDataSet[id].title = value;
        setSelectedStandard("");
        setSelectedInputData("");
        setData(newDataSet)
    }
    const getAllChildrens = function(id,allChildrenArray){
        if(dataset[id].children.length > 0){
            for(let childIds of dataset[id].children){
                allChildrenArray.push(childIds);
                getAllChildrens(childIds,allChildrenArray);
            }
        }

    }
    //TODO Break left and right indent to seperate functions
    const handleIndent =(type,id)=>{
        const newDataSet = {...dataset};
        const stdIds = Object.keys(newDataSet);
        let index = stdIds.indexOf(id.toString());
        const shiftedStd = newDataSet[id];
        //check for root and ids is not present
        if(index <= 0){
            console.error("Element is Root or id doesn't exist")
            return;
        }
        if(type === "right"){
            //shifted standard with no parent
            if(!shiftedStd.parentID){
                shiftedStd.indentation +=1;
                /*
                * find parent for the shifted std by iterating from bottom to up and comparing indentation
                */
                for(let ids of stdIds.slice(0,index).reverse()){
                    if(newDataSet[ids].indentation < shiftedStd.indentation){
                        shiftedStd.parentID = ids;
                        newDataSet[ids].children.push(id);
                        break;
                    }
                }
                //update the childerens of the shilfted standards
                let allChildrenArray = []
                getAllChildrens(id, allChildrenArray);
                for(let ids of allChildrenArray){
                    newDataSet[ids].indentation++;
                }
            }
            else{
                //check shift is possible by comparing with just above standard
                //if yes:: update parent of shifted standard with new parent and remove old parent link
                if(shiftedStd.indentation <= newDataSet[stdIds[index-1]].indentation){
                    shiftedStd.indentation++;
                    const oldParentStdID = shiftedStd.parentID;
                    //removing child from old parent
                    newDataSet[oldParentStdID].children = newDataSet[oldParentStdID].children.filter((childids)=>childids.toString() !== id.toString()); 
                    //updating parent of shifted standard
                    shiftedStd.parentID = stdIds[index-1];
                    newDataSet[stdIds[index-1]].children.push(id);
                    //updating children(indentation) of current shilfted standard
                    const allChildrenArray = [];
                    getAllChildrens(id,allChildrenArray);
                    for(let ids of allChildrenArray){
                        newDataSet[ids].indentation++;
                    }
                }
            }
        }
        else{
            //no need to shift if indentation is zero
            if(shiftedStd.indentation >0){
                //update current standard indentation;
                shiftedStd.indentation--;
                //get updated parent after left indentation
                let newParentId=null;
                for(let ids of stdIds.slice(0,index).reverse()){
                    if(newDataSet[ids].indentation < shiftedStd.indentation){
                        newParentId = ids;
                        break;
                    }
                }
                //delinking older parent
                newDataSet[shiftedStd.parentID].children = newDataSet[shiftedStd.parentID].children.filter((childIds)=> id.toString() !== childIds.toString());
                shiftedStd.parentID = newParentId;
                if(newParentId){
                    newDataSet[newParentId].children.push(id);
                }
                //update current standard's childredn indentation
                let allChildrenArray=[];
                getAllChildrens(id,allChildrenArray);
                for(let ids of allChildrenArray){
                    newDataSet[ids].indentation--;
                }
            }
        } 
        setData(newDataSet);
    }
    const handleDragStart=(e, standardId)=>{
        e.dataTransfer.setData("id", standardId);
        const ele = document.getElementById(`app_course_${standardId}`);
        ele.style.backgroundColor="aliceblue";
        e.dataTransfer.setDragImage(ele,0,0);
    }
    const handleDrop = (ev, standardId)=>{
        const draggedStandardID = ev.dataTransfer.getData("id");
        const ele = document.getElementById(`app_course_${draggedStandardID}`);
        ele.style.backgroundColor="white";
        let dataSetValues = Object.values(dataset);
        let dataSetKeys = Object.keys(dataset);
        let draggedStandardObject = dataSetValues.filter((stdObject)=>stdObject.id.toString() === draggedStandardID.toString())[0] || {};
        let newParentObject = dataSetValues.filter((stdObject)=>stdObject.id.toString() === standardId.toString())[0] || {};
        /*
         * To drag and drop standard from one sub tree to another subtree
         * 1. To move standard Tree drag selected standard tree and drop it in the parent of destination standard tree 
         * 2. Indentation of selected standard should not change
         * 3. update parent ref for selected standard
         * 4. check for parent indentation before and after drag n drop 
         * 5. move selected standard and all its childeren
         */
        if((Object.keys(newParentObject).length > 0) && Object.keys(draggedStandardObject).length > 0){
            if((draggedStandardObject.indentation > newParentObject.indentation) && (Math.abs(draggedStandardObject.indentation - newParentObject.indentation)===1)){
                const oldParentId = draggedStandardObject.parentID;
                if(oldParentId){
                    draggedStandardObject.parentID = standardId;
                    newParentObject.children.push(draggedStandardID);
                    let newDataSet = {};
                    //dragging from source downward direction
                    if(dataSetKeys.indexOf(standardId) > dataSetKeys.indexOf(draggedStandardID)){
                        //from top to source
                        for (const dataValue of dataSetValues.slice(0,dataSetKeys.indexOf(draggedStandardID))) {
                            if(dataValue.id === oldParentId){
                                dataValue.children = dataValue.children.filter((childIds)=>childIds !== draggedStandardID);
                            }
                            newDataSet[dataValue.id] = {...dataValue};
                        }
                        let allChildrenDraggedDatasetArray=[];
                        getAllChildrens(draggedStandardID, allChildrenDraggedDatasetArray);
                        let allChildrenNewParenArray=[];
                        getAllChildrens(standardId, allChildrenNewParenArray);
                        //from source to new parent
                        for (const dataValue of dataSetValues.slice(dataSetKeys.indexOf(draggedStandardID),dataSetKeys.indexOf(standardId))) {
                            if(allChildrenDraggedDatasetArray.indexOf(dataValue.id) === -1 && dataValue.id!==draggedStandardID){
                                newDataSet[dataValue.id] = {...dataValue};
                            }
                        }
                        newDataSet[standardId] = {...dataset[standardId]};
                        for (const iterator of allChildrenNewParenArray) {
                            newDataSet[iterator] = {...dataset[iterator]};
                        }
                        newDataSet[draggedStandardID] = {...dataset[draggedStandardID]};
                        newDataSet[draggedStandardID].parentID = standardId;

                        for (const iterator of allChildrenDraggedDatasetArray) {
                            newDataSet[iterator] = {...dataset[iterator]};
                        }
                        //from new parent to rest of the tree
                        for (const dataValue of dataSetValues.slice(dataSetKeys.indexOf(standardId)+1)) {
                            if(!newDataSet[dataValue.id]){
                                newDataSet[dataValue.id] = {...dataValue};
                            }
                        }
                        setData(newDataSet)
                    }
                    else{
                        //from top to new parent
                        for (const dataValue of dataSetValues.slice(0, dataSetKeys.indexOf(standardId))) {
                            newDataSet[dataValue.id] = {...dataValue};
                        }
                        newDataSet[standardId] = {...dataSetValues.filter((val)=>val.id === standardId)[0]}
                        let allChildrenNewParenArray=[];
                        getAllChildrens(standardId, allChildrenNewParenArray);
                        for (const iterator of allChildrenNewParenArray) {
                            newDataSet[iterator] = {...dataset[iterator]};
                        }
                        let allChildrenDraggedDatasetArray=[];
                        getAllChildrens(draggedStandardID, allChildrenDraggedDatasetArray);
                        newDataSet[draggedStandardID] = {...dataset[draggedStandardID]};
                        newDataSet[draggedStandardID].parentID = standardId;
                        for (const iterator of allChildrenDraggedDatasetArray) {
                            newDataSet[iterator] = {...dataset[iterator]};
                        }
                        //new parent to souce
                        for (const dataValue of dataSetValues.slice(dataSetKeys.indexOf(standardId)+1)) {
                            if(!newDataSet[dataSetValues.id]){
                                if(dataValue.id === oldParentId){
                                    dataValue.children = [...dataValue.children.filter((childIds)=>childIds !== draggedStandardID)];
                                }
                                newDataSet[dataValue.id] = {...dataValue};
                            }
                        }
                    }
                    setData(newDataSet)
                } 
            }
        }
    }
    useEffect(() => {
		if (selectedStandard && document.querySelector(".app__standard__input")) {
			document.querySelector(".app__standard__input").focus();
		}
    }, [selectedStandard]);
    return(
        <div className="app__course_content">
            {/*TODO take course name from dataset remove hardcoded value */}
            <h4 className="app_course_title">{"Mathematics"}</h4>
            <div className="app__course_header app__course_border">
                <div className="app__course_header_1">
                    <h4><b>Actions</b></h4>
                    <p><b>Move, Indent,<br/> Outdent, Delete</b></p>
                </div>
                <div className="app__course_header_2">
                    <h4><b>Standard</b></h4> 
                <p><b>The text of the standard</b></p>
                </div>
            </div>
            {
                Object.keys(dataset).map((id)=>{
                    return <AddStandard key={id}
                    handleDeleteRow={handleDeleteRow}
                    handleSetTitle={handleSetTitle}
                    selectedInputData={selectedInputData}
                    selectedStandard={selectedStandard}
                    setSelectedStandard={setSelectedStandard}
                    setSelectedInputData={setSelectedInputData}
                    handleIndent={handleIndent}
                    handleDragStart={handleDragStart}
                    handleDrop={handleDrop}
                        {...dataset[id]}
                    />
                })
            }
            <div className="app_course_add_standard">
                <button onClick={handleAddRow}>
                    <img src={Add} width="20.8px" alt="add"></img>
                    Add a standard
                </button>
            </div>
        </div>
    )
}