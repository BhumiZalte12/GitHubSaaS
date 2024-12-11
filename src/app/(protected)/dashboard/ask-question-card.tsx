'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
//import { Image } from 'lucide-react';//-
import { Image } from 'lucide-react';// Import from '@lucide-icons/react' instead of 'lucide-react'//+
import { string } from 'zod';
import { askQuestion } from './actions';
import { readStreamableValue } from 'ai/rsc';
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from '@/app/(protected)/dashboard/code-references'


const AskQuestionCard = () => {
  const {project }= useProject();
  const [question, setQuestion] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading]  = React.useState(false);
const [ answer ,setAnswer] = React.useState('')
const [filesReferences, setFilesReferences] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([]);


  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
setAnswer('')
setFilesReferences([ ])
    e.preventDefault();
    if(!project?.id) return 
    setLoading(true)
    


    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilesReferences(filesReferences || []); 
    for await (const delta of readStreamableValue(output)){
        if (delta) {
            setAnswer(ans => ans + delta)
        }
    }
    setLoading(false)
  };
  return (<>
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[80vw]'>
      <DialogHeader>
        <DialogTitle>
          <Image src="/logo.png" alt="logo" width={40} height={40} />
        </DialogTitle>
      </DialogHeader>
      <div className='h-4' ></div>
<MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll' />
<CodeReferences fileReferences={filesReferences} />
      <Button type='button' onClick={() => {setOpen(false)}}>
        Close
      </Button>
          <h1>Files References</h1>

          {filesReferences && filesReferences.length > 0 ? (
            filesReferences.map((file) => <span key={file.fileName}>{file.fileName}</span>)
          ) : (
            <span>No files referenced.</span>
          )}
      </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>

        
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea 
              placeholder="Which file should I edit to change the home page?"
              value={question} onChange={e => setQuestion(e.target.value)} />
        
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>Ask Dionysus!</Button>
          </form>
        </CardContent>
        {/* ... rest of the code ... */}
      </Card>
    
    </>
  );
};

export default AskQuestionCard;
