import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { toast } from "sonner";

import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import SelectList from "../SelectList";
import Textbox from "../Textbox";
import UserList from "./UsersSelect";
import { uploadToCloudinary } from "../../utils/uploadFile";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const AddTask = ({ open, setOpen, task }) => {
  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    team: [],
    stage: "",
    priority: "",
    assets: [],
    description: "",
    links: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [team, setTeam] = useState(task?.team || []);
  const [priority, setPriority] = useState(
    task?.priority ? task.priority.toUpperCase() : PRIORIRY[2]
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const URLS = task?.assets ? [...task.assets] : [];

  const uploadFiles = async (files) => {
    const uploadedURLs = [];
    
    for (const file of files) {
      try {
        const response = await uploadToCloudinary(file); // Pass the file directly, not FormData
        if (response && response.url) {
          uploadedURLs.push(response.url);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    }
    
    return uploadedURLs;
  };

  const handleOnSubmit = async (data) => {
    try {
      setUploading(true);
      let uploadedAssets = [];
      
      if (assets.length > 0) {
        uploadedAssets = await uploadFiles(assets);
      }

      const newData = {
        ...data,
        assets: [...URLS, ...uploadedAssets],
        team,
        stage,
        priority,
      };

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      toast.success(res.message);
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error || 'Error processing your request');
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAssets(Array.from(e.target.files));
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Dialog.Title
          as='h2'
          className='text-base font-bold leading-6 text-gray-900 mb-4'
        >
          {task ? "UPDATE TASK" : "ADD TASK"}
        </Dialog.Title>

        <div className='mt-2 flex flex-col gap-6'>
          <Textbox
            placeholder='Task title'
            type='text'
            name='title'
            label='Task Title'
            className='w-full rounded'
            register={register("title", {
              required: "Title is required!",
            })}
            error={errors.title ? errors.title.message : ""}
          />
          <UserList setTeam={setTeam} team={team} />
          <div className='flex gap-4'>
            <SelectList
              label='Task Stage'
              lists={LISTS}
              selected={stage}
              setSelected={setStage}
            />
            <SelectList
              label='Priority Level'
              lists={PRIORIRY}
              selected={priority}
              setSelected={setPriority}
            />
          </div>
          <div className='flex gap-4'>
            <div className='w-full'>
              <Textbox
                placeholder='Date'
                type='date'
                name='date'
                label='Task Date'
                className='w-full rounded'
                register={register("date", {
                  required: "Date is required!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
            </div>
            <div className='w-full flex items-center justify-center mt-4'>
              <label
                className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4'
                htmlFor='imgUpload'
              >
                <input
                  type='file'
                  className='hidden'
                  id='imgUpload'
                  
                  onChange={handleSelect}
                  multiple={true}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <BiImages />
                <span>Add Assets</span>
              </label>
            </div>
          </div>

          <div className='w-full'>
            <p>Task Description</p>
            <textarea
              name='description'
              {...register("description")}
              className='w-full bg-transparent px-3 py-1.5 2xl:py-3 border border-gray-300
              dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700
              text-gray-900 dark:text-white outline-none text-base focus:ring-2
              ring-blue-300 rounded'
            ></textarea>
          </div>

          <div className='w-full'>
            <p>
              Add Links{" "}
              <span className='text-gray-600'>
                separated by comma (,)
              </span>
            </p>
            <textarea
              name='links'
              {...register("links")}
              className='w-full bg-transparent px-3 py-1.5 2xl:py-3 border border-gray-300
              dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700
              text-gray-900 dark:text-white outline-none text-base focus:ring-2
              ring-blue-300 rounded'
            ></textarea>
          </div>
        </div>

        {isLoading || isUpdating || uploading ? (
          <div className='py-4'>
            <Loading />
          </div>
        ) : (
          <div className='bg-gray-50 mt-6 mb-4 sm:flex sm:flex-row-reverse gap-4'>
            <Button
              label='Submit'
              type='submit'
              className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto rounded'
            />
            <Button
              type='button'
              className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto border border-gray-300 rounded hover:bg-gray-50'
              onClick={() => setOpen(false)}
              label='Cancel'
            />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default AddTask;
