
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

const placeholderImagesData: ImagePlaceholder[] = [
  {
    "id": "challengeMode",
    "description": "Two chess pieces facing off, symbolizing a challenge",
    "imageUrl": "https://images.unsplash.com/photo-1562727251-fe0ca5ced4d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjaGVzcyUyMGNoYWxsZW5nZXxlbnwwfHx8fDE3NjIxNzU1MTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "imageHint": "chess challenge"
  },
  {
    "id": "freePlayMode",
    "description": "A child happily drawing with crayons, symbolizing free play",
    "imageUrl": "https://images.unsplash.com/photo-1646617747566-b7e784435a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjaGlsZCUyMGRyYXdpbmd8ZW58MHx8fHwxNzYyMTc1NTE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "imageHint": "child drawing"
  },
  {
    "id": "game-background",
    "description": "Abstract background with mathematical symbols",
    "imageUrl": "https://images.unsplash.com/photo-1626513293438-220cd82852f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxhYnN0cmFjdCUyMG1hdGh8ZW58MHx8fHwxNzYyMTA0MjcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "imageHint": "abstract math"
  },
  {
    "id": "results-trophy",
    "description": "A golden trophy for completing the game",
    "imageUrl": "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxnb2xkJTIwdHJvcGh5fGVufDB8fHx8MTc2MjA5MjA4M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    "imageHint": "gold trophy"
  },
  {
    "id": "math-ships",
    "description": "A battleship on the water, representing a naval game",
    "imageUrl": "https://images.unsplash.com/photo-1595411425722-b15242a03312?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxiYXR0bGVzaGlwfGVufDB8fHx8MTc2MjI0NzU5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    "imageHint": "battleship sea"
    }
];

export const PlaceHolderImages: ImagePlaceholder[] = placeholderImagesData;
