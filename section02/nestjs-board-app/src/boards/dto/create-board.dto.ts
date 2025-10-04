// class는 런타임에서 작동하여 파이프 같은 기능을 이용할 때 유용하다.
import { IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
