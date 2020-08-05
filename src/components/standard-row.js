import React from "react";
import Drag from "../assets/drag.svg";
import Left from "../assets/left.svg";
import Right from "../assets/right.svg";
import Delete from "../assets/delete.svg";

export default (props) => {
  const {
    handleDeleteRow,
    id,
    handleSetTitle,
    selectedInputData,
    title,
    setSelectedInputData,
    setSelectedStandard,
    handleIndent,
    selectedStandard,
    indentation,
    handleDragStart,
    handleDrop
  } = props;
  return (
    <div className="app__course__body app__course_border" id={`app_course_${id}`} onDragOver={(e)=>e.preventDefault()}
    onDrop={(e)=>{
        
        handleDrop(e,id)
    }}>
      <div className="app__course__body_action">
        <span className="app__standard__table__action">
          <img src={Drag} alt="Logo" width="20px" draggable 
          onDragStart={(e)=>{handleDragStart(e,id)}}/>
          <img src={Left} alt="Logo" width="20px" 
          onClick={(e)=>handleIndent("left",id)} />
          <img src={Right} alt="Logo" width="20px" onClick={(e)=>handleIndent("right",id)}/>
          <img src={Delete} alt="Logo" width="20px" onClick={(e) => handleDeleteRow(id)}/>
        </span>
      </div>
      <div className="app__standard__table__standard">
        {selectedStandard === id ? (
          <input
            value={selectedInputData}
            className="app__standard__input"
            placeholder="Type standard here(e.g. Numbers)"
            onChange={(e) => setSelectedInputData(e.target.value)}
            onBlur={(e) => handleSetTitle(id, selectedInputData)}
          ></input>
        ) : (
            <>
            <div className="app_standard_indent" style={{width:`${indentation*30}px`,
            // backgroundColor:"red"
            }}></div>
          <span
            className={
              title.length == 0
                ? "standard__text standard__text__empty"
                : `standard__text indentation standard__color-${indentation}`
            }
            onClick={(e) => {
              setSelectedStandard(id);
              setSelectedInputData(title);
            }}
          >
            {title.length === 0 ? "Type standard here(e.g. Numbers)" : title}
          </span>
          </>
        )}
      </div>
      </div>
  );
};
