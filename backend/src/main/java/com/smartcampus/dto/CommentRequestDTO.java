package com.smartcampus.dto;
 
 import jakarta.validation.constraints.NotBlank;
 import lombok.AllArgsConstructor;
 import lombok.Data;
 import lombok.NoArgsConstructor;
 
 @Data
 @NoArgsConstructor
 @AllArgsConstructor
 public class CommentRequestDTO {
     @NotBlank(message = "Comment content cannot be empty")
     private String content;
 }
