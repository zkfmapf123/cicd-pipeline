# Node-Mini-Todo

## ...

- 장난감용

## Jenkins pipeline use SCM

1. Pipeline > SCM으로 설정 > URL + Github Hooks 설정

   ![1](./public/1.png)

2. SCM (Git) > Credentials 설정

   - Credentials Password > Github Basic Token
   - Branch 설정 (Default Master)

     ![2](./public/2.png)

3. Script Path 설정 (Github에 있는 폴더기준)

   ![3](./public/3.png)

4. Github > Setting > Webhooks > ~/github-webhook/ 설정

   ![4](./public/4.png)
