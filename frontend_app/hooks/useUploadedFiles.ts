import { useState, useCallback } from "react";
import axios from "axios";
import { UPLOAD_API } from "../lib/apiConstants";

const useUploadedFiles = () => {
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = useCallback(
    async ({
      fileToUpload,
      prompt_category_id,
      prompt_sub_category_id,
    }: {
      fileToUpload: File;
      prompt_category_id: string;
      prompt_sub_category_id: string;
    }): Promise<any> => {
      setIsLoading(true);
      setError(null);
      setUploadResponse(null);

      const formData = new FormData();
      formData.append(`file`, fileToUpload);
      formData.append(`prompt_category_id`, prompt_category_id);
      formData.append(`prompt_sub_category_id`, prompt_sub_category_id);

      try {
        const response = await axios.post(UPLOAD_API, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setUploadResponse(response.data);
        return response.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    uploadResponse,
    uploadError: error,
    uploadIsLoading: isLoading,
    uploadFile,
  };
};

export default useUploadedFiles;

