import torch
import torchvision
print(torch.__version__)
print(torchvision.__version__)
print(torch.cuda.is_available())

import subprocess
subprocess.run([r"C:\Users\sagar\Downloads\Compressed\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe", "-version"])