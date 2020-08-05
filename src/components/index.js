import React, {useState} from 'react';

import CurriculumTool from './curriculum';
import Download from '../assets/download.svg';
import Upload from '../assets/upload.svg';
import fileDownload from '../utilities/fileDownload';
import fileUpload from '../utilities/fileUpload';
export default () =>{
    let [dataset,setData] = useState({});
    return(
        <div>
            <div className="app__title">
            <h1>Curriculum Authoring Tool</h1>
            <div style={{display:"flex"}}>
                <div className="image-upload">
                    <label htmlFor="file-input">
                        <img src={Upload} alt="Logo" width="40px"  />
                    </label>
                    <input id="file-input" type="file" accept=".json" onChange={(e)=>fileUpload(e,setData)}/>
                </div>
                <div>
                    <img src={Download} alt="Logo" width="40px" onClick={(e)=>fileDownload(dataset,setData)}/>
                </div>
            </div>
            </div>
            <CurriculumTool dataset={dataset} setData={setData} />
        </div>
    )
}