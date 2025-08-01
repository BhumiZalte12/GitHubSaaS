'use client';

import useProject from '@/hooks/use-project';
import { ExternalLink, Github } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import CommitLog from './commit-log';
import AskQuestionCard from './ask-question-card';
import MeetingCard from'./meeting-card'
import ArchiveButtton from "./archive-button"
import InviteButton from './invite-button';
import TeamMembers from './team-members';

const DashboardPage = () => {
  const { project } = useProject();

  return (
    <div className='py-4'>
    
    <div className="flex items-center justify-between flex-wrap gap-y-4">
      <div className="w-fit rounded-md bg-primary px-4 py-3">
        <div className="flex items-center">
          <Github className="size-5 text-white" />
          <div className="ml-2">
            {project?.gitHubUrl ? (
              <p className="text-sm font-medium text-white">
                This project is linked to{' '}
                
                <Link 
                  href={project?.gitHubUrl ?? ""} 
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.gitHubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            ) : (
              <p className="text-sm font-medium text-white/50">
                No GitHub URL available
              </p>
            )}
          </div>
        </div>
      </div>

<div className='h-4'></div>
<div className='flex items-center gap-4'>
  < TeamMembers />
  < InviteButton />
  < ArchiveButtton />
</div>

    </div>
    <div className='mt-4'>
        <div className='grid grid-cols gap-4 sm:grid-cols-5'>
        
        < AskQuestionCard />
<MeetingCard />
        </div>
<div className='mt-8'>
    < CommitLog  />
    

</div>
    </div>
    </div>
  );
};

export default DashboardPage;
