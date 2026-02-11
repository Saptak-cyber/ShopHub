import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'ecommerce';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, message: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, message: 'Only image files are allowed' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 }
        );
      }
    }

    // Convert files to base64
    const filePromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      return `data:${file.type};base64,${base64}`;
    });

    const base64Files = await Promise.all(filePromises);

    // Upload to Cloudinary
    let result;
    if (base64Files.length === 1) {
      const uploadResult = await uploadToCloudinary(base64Files[0], folder);
      result = {
        urls: [uploadResult.secure_url],
        details: [uploadResult],
      };
    } else {
      const uploadResults = await uploadMultipleToCloudinary(base64Files, folder);
      result = {
        urls: uploadResults.map((r) => r.secure_url),
        details: uploadResults,
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to upload images',
      },
      { status: 500 }
    );
  }
}
