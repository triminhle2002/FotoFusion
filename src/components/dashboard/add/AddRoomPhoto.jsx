import React, { useContext, useEffect, useState } from 'react'
import * as photo from '../../../apis/photo'
import * as roomApi from '../../../apis/room'
import AuthContext from '../../../context/authProvider';
import { Spinner } from '@material-tailwind/react';
import { ToastContainer, toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../../config/firebase.config';
import { v4 } from "uuid";


const AddRoomPhoto = () => {
    const [name, setName] = useState('')
    const [category, setCategory] = useState('')
    const [is_status, setIs_status] = useState(false)
    const [price, setPrice] = useState('')


    const [img_name, setimg_name] = useState('')
    const [room_id, setRoom_id] = useState('')
    const [submit, setSubmit] = useState(false);
    const [loading, setLoading] = useState(false);
    const { auth } = useContext(AuthContext);
    const [imageUploads, setImageUpload] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);


    const handleChange = (e) => {
        for (let i = 0; i < e.target.files.length; i++) {
            const newImage = e.target.files[i];
            newImage["id"] = Math.random();
            setImageUpload((prevState) => [...prevState, newImage]);
        }
    };
    const uploadFile = async () => {

        await Promise.all(
            imageUploads.map(async (imageUpload) => {
                const imageRef = ref(storage, `/RentalProducts/Equipment/${imageUpload.name + v4()}`);
                try {
                    const snapshot = await uploadBytes(imageRef, imageUpload);
                    const url = await getDownloadURL(snapshot.ref);
                    setImageUrls((prev) => [...prev, url]);
                } catch (error) {
                    console.error("Error uploading image: ", error);
                }
            })
        );
    }

    const notify = (message, type) => {
        const toastType = type === 'success' ? toast.success : toast.error;
        return toastType(message, {
            position: 'top-right',
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
        });
    };
    useEffect(() => {
        const fetchAdd = async () => {
            try {
                const addItem = await roomApi.CreateARoom(auth.accessToken, name, is_status, category, price);
                console.log('productid lấy từ đấu' + addItem.id);
                // Update state asynchronously
                setRoom_id(addItem.id);
                if (addItem.statusCode === 201) {
                    notify("Thêm phòng concept mới thành công", 'success');
                    setLoading(false);
                    setSubmit(false);
                } else {
                    notify("Thêm phòng concept mới không thành công");
                    setLoading(false);
                    setSubmit(false);
                }
            } catch (error) {
                console.error('Error in fetchAdd:', error);
                setLoading(false);
                setSubmit(false);
            }
        };

        if (submit && auth.accessToken !== undefined) {
            fetchAdd();
        }
    }, [submit]);

    //Thêm hình ảnh vào bảng hình ảnh

    useEffect(() => {
        if (room_id && imageUrls.length === imageUploads.length) {
            console.log(room_id);
            const performAddProduct = async () => {
                try {
                    // Use Promise.all to handle asynchronous operations in map
                    await Promise.all(imageUrls.map(async (url_photo) => {
                        const addEquipmentPhoto = await photo.updateRoomPhoto(auth.accessToken, img_name, url_photo, room_id);
                        if (addEquipmentPhoto.statusCode === 201) {
                            //notify(addEquipmentPhoto.response.message, 'success');
                            setLoading(false);
                            setSubmit(false);
                        } else {
                            // notify(addEquipmentPhoto.error.message);
                            setLoading(false);
                            setSubmit(false);
                        }
                    }));
                } catch (error) {
                    console.error('Error', error);
                    setLoading(false);
                    setSubmit(false);
                }
            };

            // Call the function when prod_id changes
            performAddProduct();
        }
    }, [imageUrls]);


    const handleSubmit = (e) => {
        e.preventDefault();
        uploadFile();
        setSubmit(true);
        setLoading(true);
    };
    return (
        <>
            <ToastContainer />
            <div className='flex items-center justify-center'>
                <div className='w-2/3 bg-black h-auto m-4 p-4 flex items-center justify-center'>
                    <span className=' text-white text-2xl'>Thêm Một Phòng Concept Mới </span>
                </div>
            </div>
            <div className='w-full '>
                <div className='flex items-center justify-center'>
                    <div className='w-[80%] p-8 border border-black rounded-lg shadow-xl'>
                        <form action="" onSubmit={(e) => handleSubmit(e)}>
                            <div className="flex flex-col mb-6">
                                <label className="font-medium text-left text-lg mb-2 text-black " htmlFor="">
                                    Nhập tên của phòng chụp ảnh
                                </label>
                                <input
                                    id="nameInput"
                                    className="px-4 py-3 border-2 border-[#afafaf] rounded-lg shadow-lg outline-none focus:border-primaryColor placeholder:text-lg text-lg"
                                    required
                                    type="text"
                                    autoComplete=""
                                    placeholder="Tên của phòng chụp ảnh"
                                    onChange={(event) => setName(event.target.value)}
                                    value={name}
                                />
                            </div>

                            <div className="flex flex-col mb-6">
                                <label className="font-medium text-left text-lg mb-2 text-black " htmlFor="">
                                    Nhập loại phòng chụp ảnh (vd Phòng chụp Trung Thu , Phòng chụp Noel .....)
                                </label>
                                <input
                                    id="categoryInput"
                                    className="px-4 py-3 border-2 border-[#afafaf] rounded-lg shadow-lg outline-none focus:border-primaryColor placeholder:text-lg text-lg"
                                    required
                                    type="text"
                                    autoComplete=""
                                    placeholder="Nhập loại phòng chụp ảnh"
                                    onChange={(event) => { setimg_name(event.target.value); setCategory(event.target.value) }}
                                    value={category}
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <div className="w-[48%] flex flex-col mb-6">
                                    <label className="font-medium text-left text-lg mb-2 text-black " htmlFor="">
                                        Nhập giá cho thuê phòng chụp ảnh
                                    </label>
                                    <input
                                        id="priceInput"
                                        className="px-4 py-3 border-2 border-[#afafaf] rounded-lg shadow-lg outline-none focus:border-primaryColor placeholder:text-lg text-lg"
                                        required
                                        type="number"
                                        autoComplete=""
                                        placeholder="...............VNĐ"
                                        onChange={(event) => setPrice(event.target.value)}
                                        value={price}
                                    />
                                </div>

                            </div>

                            <div className="flex flex-col mb-6">
                                <label className="font-medium text-left text-lg mb-2 text-black " htmlFor="">
                                    Đưa hình ảnh của phòng chụp ảnh lên
                                </label>
                                <input
                                    id="urlphotoinput"
                                    className="px-4 py-3 border-2 border-[#afafaf] rounded-lg shadow-lg outline-none focus:border-primaryColor placeholder:text-lg text-lg"
                                    required
                                    type="file"
                                    autoComplete=""
                                    multiple
                                    placeholder="url_photo"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="py-2 px-4 bg-btnprimary text-blue-gray-900 rounded-md w-32 mx-6 hover:bg-light-green-800"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <Spinner className="h-6 w-6 mr-4" /> <span>Loading...</span>
                                        </div>
                                    ) : (
                                        <span>Thêm</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </>
    )
}

export default AddRoomPhoto
