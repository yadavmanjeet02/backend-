import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        //upload the path to cloudinary
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        console.log("file is uploaded on cloudinary",response.url);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locall saved temporary file as the upload option failed 
        return null;
    }

}

// cloudinary.v2.uploader.upload('https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', 
//             {public_id: 'shoes'},
//             function(error,result){console.log(result);});


export {uploadOnCloudinary}
