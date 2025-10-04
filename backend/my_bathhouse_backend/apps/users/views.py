# my_bathhouse_backend/apps/users/views.py
from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# from .serializers import RegistrationSerializer
from .serializers import UserSerializer

class RegisterAPI(APIView):
    def post(self, request, *args, **kwargs):
        # serializer = RegistrationSerializer(data=request.data)
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

