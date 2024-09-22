package sg.edu.ntu.garang_guni_backend.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.web.bind.MethodArgumentNotValidException;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageUnsupportedTypeException;
import sg.edu.ntu.garang_guni_backend.exceptions.item.ItemNotFoundException;
import sg.edu.ntu.garang_guni_backend.services.impls.ImageServiceImpl;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ImageServiceImpl imgService;

    @Autowired
    private ObjectMapper objectMapper;
    private static Item sampleItem;
    private static Item updatedItem;
    private static Item itemWithoutName;
    private static Item itemWithoutDescription;
    private static Item itemWithNothing;
    private static MockMultipartFile imageToAdd;
    private static MockMultipartFile imageToAdd2;
    private static String base64ImgToAddData;
    private static String base64ImgToAdd2Data;
    
    @BeforeAll
    static void setUp() {
        sampleItem = Item.builder()
                .itemName("Aluminium Cans")
                .itemDescription("It's a metal can.")
                .build();
        
        updatedItem = Item.builder()
                .itemName("Steel Cans")
                .itemDescription("It's STILL a metal can.")
                .build();

        itemWithoutName = Item.builder()
                .itemDescription("It's a metal can.")
                .build();

        itemWithoutDescription = Item.builder()
                .itemName("Aluminium Cans")
                .build();

        itemWithNothing = new Item();

        imageToAdd = new MockMultipartFile("image",
                "image_to_add.png", 
                "image/png",
                "This is a test image".getBytes());

        imageToAdd2 = new MockMultipartFile("image",
                "image_to_add2.png", 
                "image/png",
                "This is a test image 2".getBytes());

        base64ImgToAddData = "VGhpcyBpcyBhIHRlc3QgaW1hZ2U=";
        base64ImgToAdd2Data = "VGhpcyBpcyBhIHRlc3QgaW1hZ2UgMg==";
    }

    @DisplayName("Create Item - Successful")
    @Test
    void createItemTest() throws Exception {
        postVerifyAndRetrieveSampleItemResponse();       
    }

    @DisplayName("Create Item - Missing Parameters")
    @Test
    void createItemWithMissingParametersTest() throws Exception {
        postAndVerifyBadRequest(itemWithoutName);
        postAndVerifyBadRequest(itemWithoutDescription);
        postAndVerifyBadRequest(itemWithNothing);
    }

    @DisplayName("Get Item By Id - Sucessful")
    @Test
    void getItemByIdTest() throws Exception {
        String createdItemAsJson = postVerifyAndRetrieveSampleItemResponse(); 
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        RequestBuilder getRequest = MockMvcRequestBuilders
                .get("/items/" + createdItemId);

        mockMvc.perform(getRequest)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId")
                            .value(createdItemId))
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."));
    }

    @DisplayName("Get Item By Id - Invalid Id")
    @Test
    void getItemByNonExistentIdTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        RequestBuilder getRequest = MockMvcRequestBuilders.get(
                "/items/" + createdItemId);

        mockMvc.perform(getRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Update Item - Successful")
    @Test
    void updateItemTest() throws Exception {
        String createdItemAsJson = postVerifyAndRetrieveSampleItemResponse();
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        String updatedItemAsJson = objectMapper.writeValueAsString(updatedItem);

        RequestBuilder putRequest = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemAsJson);

        mockMvc.perform(putRequest)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId")
                            .value(createdItemId))
                .andExpect(jsonPath("$.itemName")
                            .value("Steel Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's STILL a metal can."));
    }

    @DisplayName("Update Item - Invalid Id")
    @Test
    void updateItemWithNonExistantIdTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        String updatedItemAsJson = objectMapper.writeValueAsString(updatedItem);

        RequestBuilder putRequest = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemAsJson);

        mockMvc.perform(putRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Update Item - Invalid Item")
    @Test
    void updateItemWithInvalidItemTest() throws Exception {
        String createdItemAsJson = postVerifyAndRetrieveSampleItemResponse();
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        putAndVerifyBadRequest(itemWithoutName, createdItemId);
        putAndVerifyBadRequest(itemWithoutDescription, createdItemId);
        putAndVerifyBadRequest(itemWithNothing, createdItemId);
    }

    @DisplayName("Delete Item - Successful")
    @Test
    void deleteItemTest() throws Exception {
        String createdItemAsJson = postVerifyAndRetrieveSampleItemResponse();
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        RequestBuilder deleteRequest = MockMvcRequestBuilders
                .delete("/items/" + createdItemId);

        mockMvc.perform(deleteRequest)
                .andExpect(status().isNoContent());
        
        RequestBuilder getRequest = MockMvcRequestBuilders
                .get("/items/" + createdItemId);
        
        mockMvc.perform(getRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Delete Item - Invalid Id")
    @Test
    void deleteNonExistentItemTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        RequestBuilder deleteRequest = MockMvcRequestBuilders
                .delete("/items/" + createdItemId);

        mockMvc.perform(deleteRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Add Image To Item - Successful")
    @Test
    void addImageToItemtest() throws Exception {
        String createdItemAsJson = postVerifyAndRetrieveSampleItemResponse();
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");  
        
        RequestBuilder postRequest = MockMvcRequestBuilders
                .multipart("/items/" + createdItemId + "/images")
                .file(imageToAdd);
                
        String unFormattedImgId = mockMvc.perform(postRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Get Content As String -> gives extra ""
        String imgId = unFormattedImgId.replaceAll("^\"|\"$", "");

        assertTrue(imgService.isLinked(imgId, createdItemId));
    }

    @DisplayName("Add Image To Item - Invalid Id")
    @Test
    void addImageToNonExistantItemtest() throws Exception {
        UUID invalidId = UUID.randomUUID();

        RequestBuilder postRequest = MockMvcRequestBuilders
                .multipart("/items/" + invalidId + "/images")
                .file(imageToAdd);
                
        mockMvc.perform(postRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Add Image To Item - Invalid File type")
    @Test
    void addTextFileToItemtest() throws Exception {
        String createdItemAsJson = postVerifyAndRetrieveSampleItemResponse();
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");  

        MockMultipartFile invalidImage = new MockMultipartFile("image",
                "text_to_add.txt", 
                "text/plain",
                "This is a text file".getBytes());
        
        RequestBuilder postRequest = MockMvcRequestBuilders
                .multipart("/items/" + createdItemId + "/images")
                .file(invalidImage);
                
        mockMvc.perform(postRequest)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ImageUnsupportedTypeException));
    }

    @DisplayName("View All Images - Successful")
    @Test
    void viewAllImagesTest() throws Exception {
        String createdItemAsJson = postVerifyAndRetrieveSampleItemResponse();
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");  

        RequestBuilder postRequest = MockMvcRequestBuilders
                .multipart("/items/" + createdItemId + "/images")
                .file(imageToAdd);
                
        String unFormattedImgId = mockMvc.perform(postRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        // Get Content As String -> gives extra ""
        String imgId = unFormattedImgId.replaceAll("^\"|\"$", "");
        
        assertTrue(imgService.isLinked(imgId, createdItemId));
        
        RequestBuilder postRequest2 = MockMvcRequestBuilders
                .multipart("/items/" + createdItemId + "/images")
                .file(imageToAdd2);
                
        String unFormattedImgId2 = mockMvc.perform(postRequest2)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Get Content As String -> gives extra ""
        String imgId2 = unFormattedImgId2.replaceAll("^\"|\"$", "");

        assertTrue(imgService.isLinked(imgId2, createdItemId));

        RequestBuilder getAllImgRequest = MockMvcRequestBuilders
                .get("/items/" + createdItemId + "/images");
        
        String retrievedImgListJson = mockMvc.perform(getAllImgRequest)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        List<String> images = objectMapper.readValue(retrievedImgListJson, 
                new TypeReference<List<String>>() {}); 
        
        assertEquals(2, images.size());
        assertTrue(images.stream().anyMatch(image -> 
                image.equals(base64ImgToAddData)));
        assertTrue(images.stream().anyMatch(image -> 
                image.equals(base64ImgToAdd2Data)));
    }

    @DisplayName("View All Images - Invalid Id")
    @Test
    void viewAllImagesWithNonExistantItemTest() throws Exception {
        UUID randomUuid = UUID.randomUUID();
        RequestBuilder getRequest = MockMvcRequestBuilders
                .get("/items/" + randomUuid + "/images");
        
        mockMvc.perform(getRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    private String postVerifyAndRetrieveSampleItemResponse() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder postRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
        
        return mockMvc.perform(postRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
    }

    private void postAndVerifyBadRequest(Item malformItem) throws Exception {
        String newMalformItemAsJson = objectMapper.writeValueAsString(malformItem);
        
        RequestBuilder postRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newMalformItemAsJson);

        mockMvc.perform(postRequest)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
    }

    private void putAndVerifyBadRequest(Item malformItem, String id) throws Exception {
        String newMalformItemAsJson = objectMapper.writeValueAsString(malformItem);
        
        RequestBuilder putRequest = MockMvcRequestBuilders
                .put("/items/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(newMalformItemAsJson);

        mockMvc.perform(putRequest)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
    }
}
