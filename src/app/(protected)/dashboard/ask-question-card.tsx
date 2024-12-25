'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "react-hot-toast";
import MDEditor from '@uiw/react-md-editor';
import { askQuestion } from './actions';
import { readStreamableValue } from 'ai/rsc';
import CodeReferences from '@/app/(protected)/dashboard/code-references';

import { api } from '@/trpc/react';
import useRefetch from '@/hooks/use-refetch';

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [filesReferences, setFilesReferences] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([]);

  // Mutation hook for saving the answer
  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnswer('');
    setFilesReferences([]);
    
    if (!project?.id) return;
    
    setLoading(true);

    // Get the output and files references from the askQuestion action
    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilesReferences(filesReferences || []);

    // Handle the response (streamable or not)
    if (typeof output !== 'string') {
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((prev) => prev + delta); // Update answer progressively
        }
      }
    } else {
      setAnswer(output); // Set the full answer if it's not a stream
    }

    setLoading(false);
  };
const refetch = useRefetch()
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className='flex items-center gap-2'>
              <DialogTitle>
                <img src="/logo.png" alt="logo" width={40} height={40} />
              </DialogTitle>
              <Button 
                disabled={saveAnswer.isPending} 
                variant="outline" 
                onClick={() => {
                  saveAnswer.mutate({
                    projectId: project!.id,
                    question,
                    answer,
                    filesReferences,
                  }, {
                    onSuccess: () => {
                      // Show success message after saving the answer
                      toast.success('Answer saved successfully');
                      refetch()
                    },
                    onError: () => {
                      // Show error message if saving fails
                      toast.error('Failed to save answer');
                    }
                  });
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll" />
          
          <div className="h-4"></div>
          <CodeReferences filesReferences={filesReferences} />
          
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>

          <h1>Files References</h1>
          {filesReferences.length > 0 ? (
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
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask Dionysus!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
