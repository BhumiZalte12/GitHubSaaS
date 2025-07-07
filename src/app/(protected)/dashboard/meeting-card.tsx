
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadFile } from '@/lib/firebase'; // Update import to use Supabase
import { File, Presentation, Upload } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { CircularProgressbar } from 'react-circular-progressbar';
import useProject from '@/hooks/use-project';
import { toast } from 'react-hot-toast';
import { api } from '@/trpc/react';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

const MeetingCard = () => {
  const {project } = useProject()
  const processMeeting = useMutation({mutationFn: async(data : {meetingUrl : string, meetingId : string,projectId : string})=>
  {
    const {meetingUrl,meetingId,projectId} = data
    const response = await axios.post('/api/process-meeting',{meetingUrl,meetingId,projectId})
    return response.data
    }}
  )
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const router = useRouter();
const uploadMeeting = api.project.uploadMeeting.useMutation()
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
    },
    multiple: false,
    maxSize: 50_000_000, // 50 MB
    onDrop: async (acceptedFiles) => {
      if(!project) return 
      setIsUploading(true);
      const file = acceptedFiles[0];
      if(!file) return


      try {
        console.log('Uploading file:', File.name);
        const downloadURL = await uploadFile(file as File, setProgress) as string;
        window.alert(`File uploaded successfully: ${downloadURL}`);
        uploadMeeting.mutate(
          {
            projectId : project.id,
            meetingUrl : downloadURL,
            name : file.name
          }, {
            onSuccess : (meeting) =>
            {
              console.log('Meeting uploaded successfully')
              // Show success message after saving the meeting
              toast.success('Meeting uploaded successfully');
              router.push('/meetings')
              processMeeting.mutateAsync({meetingUrl : downloadURL , meetingId : meeting.id,projectId : project.id})
              
            },onError : () =>
            {
              toast.error('Failed to upload meeting.');
            }
          }
        )
      } catch (error) {
        console.error('Upload failed:', error);
        window.alert('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-10">
      {!isUploading && (
        <div {...getRootProps()} className="flex flex-col items-center">
          <input {...getInputProps()} />
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with Dionysus.
            <br />
            Powered by AI.
          </p>
          <div className="mt-6">
            <Button>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
            </Button>
          </div>
        </div>
      )}
      {isUploading && (
        <div className="w-32 h-32">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
          />
          <p className="text-sm text-gray-500 text-center">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;



